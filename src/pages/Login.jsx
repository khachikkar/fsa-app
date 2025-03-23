import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import {useRedirectIfLoggedIn} from "../hooks/useAuthRedirect.js";

export default function Login() {

    const isChecking = useRedirectIfLoggedIn();

    if (isChecking) {
        return <p className="text-center mt-10">🔄 Ստուգում ենք մուտքը...</p>;
    }

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("✅ Մուտք հաջողվեց։");
            setTimeout(() => navigate("/profile"), 1500);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">🔐 Մուտք</h1>
            <input
                type="email"
                placeholder="Email"
                className="border p-2 mb-2 w-full"
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                className="border p-2 mb-2 w-full"
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin} className="bg-green-600 text-white px-4 py-2">
                Մուտք գործել
            </button>
            {message && <p className="mt-4 text-sm">{message}</p>}
        </div>
    );
}
