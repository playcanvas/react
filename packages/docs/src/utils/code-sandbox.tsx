"use client";

import React, { useState, useRef, useEffect, useCallback, ReactNode, FC, FC } from 'react';
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
import { useQuery } from '@tanstack/react-query';

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
  preload?: boolean;
  // example?: string | Promise<string>;
  // pkgJSON?: Package | string | Promise<Package | string>;
  // importReplacements?: Array<ImportReplacement>;
  // dependencies?: Record<string, string>;
  // skipRedirect?: boolean;
  // ignoreInternalImports?: boolean;
  // preload?: boolean;
  // autoDeploy?: boolean;
  // onLoadComplete?: OnLoadComplete;
  // afterDeploy?: (sandboxUrl: string, sandboxId: string) => unknown;
  // afterDeployError?: (error: ErrorType) => unknown;
  // providedFiles?: Files;
  // children: (obj: {
  //   isLoading: boolean;
  //   isDeploying: boolean;
  //   error?: ErrorType;
  //   sandboxId?: string;
  //   sandboxUrl?: string;
  //   onClick: (e?: MouseEvent) => void;
  // }) => ReactNode;
  // style?: Record<string, unknown>;
  extensions?: string[];
  template?: 'create-react-app' | 'create-react-app-typescript' | 'vue-cli';
};


export const CodeSandBoxButton = ({ preload = false, ...props }: Props) => {

  const [requestSubmit, setRequestSubmit] = useState(false);

  const onClick = useCallback(() => {
    setRequestSubmit(true);
  }, []);


  console.log('enabled', requestSubmit || preload)

  // Prepare the files
  const { data: fileInfo, error : fileInfoError, isPending: fileInfoPending } = useQuery({
    queryKey: ['fetchFiles', props.examplePath, props.gitInfo.repository, props.gitInfo.account, props.gitInfo.branch],
    queryFn: () => {
      console.log('loading files', props)
      return fetchFiles(props)
    },
    enabled: requestSubmit || preload,
  });
  
  // Submit the files, but only when the files are ready and the request is submitted
  const { data: sbInfo, error : sbInfoError, isPending: sbInfoPending } = useQuery({
    queryKey: [JSON.stringify(props)],
    queryFn: () => null,//sendFilesToCSB(props),
    enabled: requestSubmit && !!fileInfo,
  });

  // Open the link if availabvle
  useEffect(() => {
    if (sbInfo && sbInfo.sandboxUrl && requestSubmit) {
      window.open(sbInfo.sandboxUrl);
    }
  }, [sbInfo]);

  // If there is an error, disable the button
  if(fileInfoError || sbInfoError) {
    console.log('error', fileInfoError, sbInfoError);
    return <button onClick={onClick} disabled>Error creating sandbox</button>;
  }

  // console.log('props', props);
  // console.log('fileInfo', fileInfo);
  console.log('fileInfo', fileInfo);

  // if we are in a loading state, show a loading spinner
  if((preload && fileInfoPending) || (requestSubmit && fileInfoPending)) {
    return <button onClick={onClick} disabled>Loading...</button>;
  }

  // if we are in a deploying state, show a deploying spinner
  if(requestSubmit && sbInfoPending) {
    return <button onClick={onClick} disabled>Deploying...</button>;
  }

  

  // Otherwise, show the button
  return <button onClick={onClick}>Open in CodeSandbox</button>;
}

export type PCReactCodeSandBoxButton = { 
  name: string;
  preload: boolean;
  examplePath: string
}

export const PCReactCodeSandBoxButton : FC<PCReactCodeSandBoxButton> = ({ name, examplePath }) => {
  // extensions={['.tsx', '.ts']}
  return <CodeSandBoxButton 
    name={name}
    preload
    examplePath={examplePath}
    gitInfo={{
      host: 'github',
      account: 'playcanvas',
      repository: 'react',
      branch: 'feat-codesandbox',
    }}
  />;
}
