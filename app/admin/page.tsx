import { redirect } from "next/navigation";
import { AdminWorkbench } from "@/components/admin/admin-workbench";
import { createMetadata } from "@/lib/site";

export const metadata = createMetadata(
  "Admin Control Room",
  "Secure admin workspace for editing site content, managing blog posts, and uploading media with the Python backend.",
  "/admin",
);

async function checkAdminAuth() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/auth/me`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.authenticated ? data : null;
  } catch (error) {
    return null;
  }
}

export default async function AdminPage() {
  const auth = await checkAdminAuth();
  
  if (!auth) {
    redirect('/signin');
  }
  
  return <AdminWorkbench />;
}

