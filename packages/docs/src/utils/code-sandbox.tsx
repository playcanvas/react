"use client";

import React, { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import isEqual from 'lodash.isequal';
import pick from 'lodash.pick';

import {
  fetchFiles,
  sendFilesToCSB,
  getSandboxUrl,
  finaliseCSB,
  type Package,
  type Files,
  type GitInfo,
  type ImportReplacement,
} from 'codesandboxer';

type ErrorType = {
  name: string,
  description?: string,
  content?: string,
};

type OnLoadComplete = (
  params: { parameters: string; files: Files } | { error: any }
) => void;

type Props = {
  examplePath: string;
  name?: string;
  gitInfo: GitInfo;
  example?: string | Promise<string>;
  pkgJSON?: Package | string | Promise<Package | string>;
  importReplacements?: Array<ImportReplacement>;
  dependencies?: Record<string, string>;
  skipRedirect?: boolean;
  ignoreInternalImports?: boolean;
  preload?: boolean;
  autoDeploy?: boolean;
  onLoadComplete?: OnLoadComplete;
  afterDeploy?: (sandboxUrl: string, sandboxId: string) => unknown;
  afterDeployError?: (error: ErrorType) => unknown;
  providedFiles?: Files;
  children: (obj: {
    isLoading: boolean;
    isDeploying: boolean;
    error?: ErrorType;
    sandboxId?: string;
    sandboxUrl?: string;
    onClick: (e?: MouseEvent) => void;
  }) => ReactNode;
  style?: Record<string, unknown>;
  extensions?: string[];
  template?: 'create-react-app' | 'create-react-app-typescript' | 'vue-cli';
};

const CodeSandboxDeployer = (props: Props) => {
  const {
    children = ({ onClick }) => <button type="submit" onClick={onClick}>Deploy to CodeSandbox</button>,
    pkgJSON = {},
    dependencies = {},
    providedFiles = {},
    importReplacements = [],
    extensions = [],
    style = { display: 'inline-block' },
    name,
    skipRedirect,
    autoDeploy,
    preload,
    onLoadComplete,
    afterDeploy,
    afterDeployError,
    template,
    gitInfo,
    examplePath,
  } = props;

  const [parameters, setParameters] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [sandboxId, setSandboxId] = useState<string | undefined>(undefined);
  const [sandboxUrl, setSandboxUrl] = useState<string | undefined>(undefined);
  const [deployPromise, setDeployPromise] = useState<Promise<any> | null>(null);
  const [files, setFiles] = useState<Files | undefined>(undefined);
  const [error, setError] = useState<ErrorType | undefined>(undefined);
  const [fileName, setFileName] = useState<string>('example');

  const shouldReload = useRef(false);

  // Store previous props for comparison
  const prevProps = useRef(props);

  const compareKeys = [
    'examplePath',
    'gitInfo',
    'importReplacements',
    'dependencies',
    'providedFiles',
    'name',
    'extensions',
    'template',
  ];

  const loadFiles = useCallback(() => {
    setIsLoading(true);
    const dp = fetchFiles(props)
      .then(fetchedInfo => {
        const { parameters: newParameters } = finaliseCSB(fetchedInfo, {
          extraFiles: providedFiles,
          extraDependencies: dependencies,
          name,
        });
        setParameters(newParameters);
        setIsLoading(false);
        setFiles(fetchedInfo.files);
        setFileName(fetchedInfo.fileName);

        if (onLoadComplete) {
          onLoadComplete({ parameters: newParameters, files: fetchedInfo.files });
        }
      })
      .catch(err => {
        setError(err);
        setIsLoading(false);
        if (onLoadComplete) onLoadComplete({ error: err });
      });
    setDeployPromise(dp);
    return dp;
  }, [props, providedFiles, dependencies, name, onLoadComplete]);

  const deploy = useCallback(() => {
    console.log('deployPromise');
    if (error) return;
    setIsDeploying(true);
    sendFilesToCSB(parameters, { fileName })
      .then(({ sandboxId: sId, sandboxUrl: sUrl }) => {
        setSandboxId(sId);
        setSandboxUrl(sUrl);
        setIsDeploying(false);
        setIsLoading(false);

        if (!skipRedirect && sUrl) {
          window.open(sUrl);
        }
        if (afterDeploy && sId) {
          afterDeploy(getSandboxUrl(sId, 'embed'), sId);
        }
      })
      .catch(errors => {
        if (afterDeployError) {
          afterDeployError({
            name: 'error deploying to CodeSandbox',
            content: errors,
          });
        }
        setError({
          name: 'error deploying to CodeSandbox',
          content: errors,
        });
        setIsDeploying(false);
      });
  }, [error, parameters, fileName, skipRedirect, afterDeploy, afterDeployError]);

  const deployToCSB = useCallback(
    (e?: MouseEvent) => {
      if (e) e.preventDefault();
      if (isDeploying) return;
      setIsDeploying(true);

      if (!shouldReload.current && deployPromise) {
        console.log('deployPromise');
        deployPromise.then(deploy);
      } else {
        shouldReload.current = false;
        loadFiles().then(deploy);
      }
    },
    [isDeploying, deployPromise, deploy, loadFiles]
  );

  // Effect to handle prop changes and set shouldReload
  useEffect(() => {
    const prev = prevProps.current;

    // Compare simple keys
    if (!isEqual(pick(props, compareKeys), pick(prev, compareKeys))) {
      shouldReload.current = true;
    } else {
      // Compare example and pkgJSON via promises
      Promise.all([props.example, prev.example]).then(([ex, prevEx]) => {
        if (ex !== prevEx) {
          shouldReload.current = true;
        } else {
          Promise.all([props.pkgJSON, prev.pkgJSON]).then(([pkg, prevPkg]) => {
            if (!isEqual(pkg, prevPkg)) {
              shouldReload.current = true;
            }
          });
        }
      });
    }

    prevProps.current = props;
  }, [props]);

  // On mount logic
  useEffect(() => {
    if (autoDeploy) {
      deployToCSB();
    } else if (preload) {
      loadFiles();
    }
  }, [autoDeploy, preload, deployToCSB, loadFiles]);

  return (
    <>
      {children({
        isLoading,
        isDeploying,
        error,
        sandboxId,
        sandboxUrl,
        onClick: deployToCSB,
      })}
    </>
  );
}

export const CodeSandbox = ({ examplePath }: { examplePath: string }) => {
  return <CodeSandboxDeployer examplePath={examplePath}
    gitInfo={{
      account: 'playcanvas',
      repository: 'react',
      branch: 'feat-codesandbox',
    }}
  >
    {({ onClick }) => (
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
      type="button"
      onClick={onClick} // Make sure to use the onClick passed in!
    >
      Upload to CodeSandbox
    </button>
  )}
  </CodeSandboxDeployer>
}

// Example usage converted to a functional component:
// 
// import React from 'react';
// import CodeSandboxDeployer from './CodeSandboxDeployer';
//
// function CodeSandbox() {
//   return (
//     <CodeSandboxDeployer
//       examplePath="packages/docs/components/HomePageExample.tsx"
//       gitInfo={{
//         account: 'playcanvas',
//         repository: 'react',
//         branch: 'feat-codesandbox',
//         host: 'github',
//       }}
//     >
//       {() => <button type="submit">Upload to CodeSandbox</button>}
//     </CodeSandboxDeployer>
//   );
// }
//
// export default CodeSandbox;