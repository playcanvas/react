import { useScript } from "../hooks/use-script.jsx"


export const Script = ({ script, ...props }) => {

    useScript(script, props);

}