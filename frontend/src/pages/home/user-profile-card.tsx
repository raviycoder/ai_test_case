import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { User } from "lucide-react";
import { useUser } from "@/hooks/use-user";

export const UserProfileCard = () => {
  const { userData } = useUser();

  return (
    <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Name
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {userData?.name || "Not provided"}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Email
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {userData?.email || "Not provided"}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Status
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  userData?.emailVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {userData?.emailVerified ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
