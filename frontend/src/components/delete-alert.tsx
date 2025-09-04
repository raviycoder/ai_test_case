import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface DeleteAlertProps {
    title: string;
    description: string;
    deleteButtonText?: string;
    onDelete: () => void;
    triggerText?: string;
    triggerVariant?: "outline" | "destructive" | "default" | "ghost" | "link" | "secondary";
    children?: React.ReactNode;
}

export function DeleteAlert({
    title,
    description,
    deleteButtonText = "Delete",
    onDelete,
    triggerText = "Delete",
    triggerVariant = "outline",
    children
}: DeleteAlertProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children || <Button variant={triggerVariant}>{triggerText}</Button>}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>{deleteButtonText}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}