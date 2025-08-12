import { useParams, useSearchParams } from "react-router-dom";

const FilesDashboard = () => {
    const { sessionId } = useParams();
    const [searchParams] = useSearchParams();
    return (
        <div className="min-w-full h-full">
            <div className="flex items-center justify-between p-4 border-b">
                <h1 className="text-lg font-semibold">Files Dashboard</h1>
                <button className="btn btn-primary">New File</button>
            </div>
        </div>
    );
}

export default FilesDashboard;