import { useScript } from "../hooks"


export const Script = ({ script, ...props }) => {

    useScript(script, props);

}