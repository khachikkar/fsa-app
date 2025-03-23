import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import { useRedirectIfLoggedIn } from "../hooks/useAuthRedirect";

export default function Login() {
    const isChecking = useRedirectIfLoggedIn();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    if (isChecking) {
        return <p className="text-center mt-10">🔄 Ստուգում ենք մուտքը...</p>;
    }

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            toast.error("📛 Սխալ մուտք կամ գաղտնաբառ");
        } else {
            toast.success("✅ Մուտք հաջողվեց");
            setTimeout(() => navigate("/profile"), 1000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Մուտք գործել</h2>
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                >
                    Մուտք
                </button>
            </div>
        </div>
    );
}
