import ReactQueryProvider from "@/docs-components/ReactQueryProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
      <html>
        <body>
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
        </body>
      </html>
    )
}