import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function Profile() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error || !data.user) {
                navigate("/login");
            } else {
                setUser(data.user);
            }
        };

        getUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">👤 Պրոֆիլ</h1>
            {user ? (
                <>
                    <p>📧 {user.email}</p>
                    <button
                        onClick={handleLogout}
                        className="mt-4 bg-red-500 text-white px-4 py-2"
                    >
                        Դուրս գալ
                    </button>
                </>
            ) : (
                <p>Բեռնվում է...</p>
            )}
        </div>
    );
}
