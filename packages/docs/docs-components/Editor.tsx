import { FC, useState, useEffect, createContext, useContext, useMemo, useRef } from "react";
import MonacoEditor from '@monaco-editor/react';
import { ErrorBoundary } from "./code-error-boundary";
import { defaultComponents } from "@client-mdx-components";
import { serialize } from "next-mdx-remote-client/serialize";
import { MDXClient, type SerializeResult } from "next-mdx-remote-client/csr";
import ActualMonacoEditor, { editor } from "monaco-editor";
import * as motion from 'motion/react';
// Required by MDX
import * as pc from 'playcanvas';
import { useModel, useSplat, useTexture, useEnvAtlas } from "../components/hooks/use-asset";
import { useApp, useMaterial, useParent } from "@playcanvas/react/hooks";

interface EditorContextType {
    code: string;
    setCode: (code: string) => void;
}

const EditorContext = createContext<EditorContextType>({ code: '', setCode: () => {} });

const EditorProvider: FC<{ children?: React.ReactNode, initialCode: string }> = ({ children, initialCode = '' }) => {

    const [code, setCode] = useState<string>(initialCode);

    return <EditorContext.Provider value={{ code, setCode }}>
        { children }
    </EditorContext.Provider>
}

type EditorProps = { 
    opts?: editor.IStandaloneEditorConstructionOptions
}

const Editor: FC<EditorProps> = () => {

    const { code, setCode } = useContext<EditorContextType>(EditorContext);
    
    // Initialize the Monaco editor with syntax highlighting
    async function handleEditorDidMount(_ : editor.IStandaloneCodeEditor, monaco: typeof ActualMonacoEditor) {

        // `onValidate` is only called when  markers are set or removed.
        // We need a way to trigger everytime code changes, but also get the latest markers.
        // This is a hack to get the latest markers.
        const setModelMarkers = monaco.editor.setModelMarkers;
        monaco.editor.setModelMarkers = function (model : editor.ITextModel, owner: string, markers: editor.IMarkerData[]) {
            setModelMarkers.call(monaco.editor, model, owner, markers);

            // Check if there are any errors
            const hasErrors = markers.some((marker: editor.IMarkerData) => marker.severity === 8);
            
            if (!hasErrors) {
                setCode(model.getValue());
            }
        }
    }

    return <MonacoEditor 
        height="100%" 
        theme="vs-dark"
        defaultLanguage={'javascript'} 
        defaultValue={code} 
        onMount={handleEditorDidMount}
        options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            lineNumbers: 'off',

            readOnly: false,              // Make it read-only when needed
            fontSize: 12,                 // Comfortable reading size
            tabSize: 2,                  // Common for JS/TS projects
            renderWhitespace: 'selection', // Shows whitespace only on selection
            smoothScrolling: true,       // Smoother scrolling experience
            cursorBlinking: 'smooth',    // Smoother cursor animation
            folding: true,               // Code folding support
            foldingHighlight: false,     // Disable folding highlight for cleaner look
            links: true,                 // Enable clickable links
            contextmenu: true,           // Right-click menu
            quickSuggestions: true,      // Show quick suggestions
            padding: { top: 16 },        // Add some padding
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            formatOnPaste: true,         // Format pasted content
            formatOnType: true,          // Format while typing
        }}
    />;
}

const Preview: FC = () => {
    const { code } = useContext<EditorContextType>(EditorContext);
    const resetKey = useRef(0);

    const components = defaultComponents;
    const [mdxSource, setMdxSource] = useState<SerializeResult | null>(null);

    useEffect(() => {
        serialize({ 
            source: code,
            options: { 
                scope: {
                    useState,
                    useMemo,
                    useEffect,
                    useSplat,
                    useModel,
                    useTexture,
                    useEnvAtlas,
                    useApp,
                    useParent,
                    useMaterial,
                    motion,
                    pc,

                }
            }, 
        }).then(setMdxSource);
    }, [code]);
        
    if (!mdxSource) return null;
    if ('error' in mdxSource) return <div>Error parsing MDX: {mdxSource.error.message}</div>;

    return (
        <ErrorBoundary resetKey={resetKey.current++} >
            <MDXClient
                {...mdxSource}
                components={components}
            />
        </ErrorBoundary>
    );
}

export { Editor, Preview, EditorProvider };