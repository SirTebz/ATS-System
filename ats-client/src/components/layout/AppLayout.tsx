import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const AppLayout = () => (
    <div className="min-h-screen bg-surface-50">
        <Navbar />
        <Sidebar />
        <main className="ml-60 pt-16 min-h-screen">
            <div className="p-6">
                <Outlet />
            </div>
        </main>
    </div>
);