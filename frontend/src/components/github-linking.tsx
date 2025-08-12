import { useLink } from "@/hooks/useLink";
import { Button } from "./ui/button";

const GithubLink = ({isLinked}: {isLinked: boolean}) => {
    const { requestScopes, isRequestingScopes, error } = useLink();

    console.log("isLinked:", isLinked);
    const handleLink = () => {
        requestScopes();
    };

    return (
        <>
        <Button onClick={handleLink} disabled={isRequestingScopes || isLinked}>
            {
                isLinked ? "Linked" : isRequestingScopes ? "Linking..." : "Link GitHub Account"
            }
        </Button>
        {error && <p className="text-red-500">{error.message}</p>}
        </>
    );
}

export default GithubLink;