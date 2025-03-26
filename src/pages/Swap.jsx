import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    Typography,
    Upload,
    Button,
    Image,
    message,
    Modal,
} from "antd";
import {
    UploadOutlined,
    SwapOutlined,
    DownloadOutlined,
} from "@ant-design/icons";
import { supabase } from "../../supabaseClient";
import { useDispatch } from "react-redux";
import { addResult } from "../../results/resultsSlice";

const { Title } = Typography;

export default function Swap() {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const templateId = searchParams.get("template");
    const [template, setTemplate] = useState(null);
    const [userImage, setUserImage] = useState(null);
    const [resultUrl, setResultUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [latestResult, setLatestResult] = useState(null);

    useEffect(() => {
        const fetchTemplate = async () => {
            const { data, error } = await supabase
                .from("templates")
                .select("*")
                .eq("id", templateId)
                .single();

            if (error || !data) {
                message.error("Template չգտնվեց։");
            } else {
                setTemplate(data);
            }
        };

        if (templateId) fetchTemplate();
    }, [templateId]);

    const beforeUpload = (file) => {
        setUserImage(file);
        return false;
    };

    const handleSwap = async () => {
        if (!userImage || !template) {
            message.warning("Վերբեռնի՛ր դեմքի նկար և ընտրիր template");
            return;
        }

        setLoading(true);
        message.loading("Մշակում ենք...");

        const toBase64 = (file) =>
            new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result.split(",")[1]);
                reader.onerror = reject;
            });

        try {
            const sourceBase64 = await toBase64(userImage);
            const templateBlob = await fetch(template.url).then((res) => res.blob());
            const targetBase64 = await toBase64(templateBlob);

            const response = await fetch("/.netlify/functions/swap", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    source_image: sourceBase64,
                    target_image: targetBase64,
                }),
            });

            const result = await response.json();
            if (result.image) {
                const finalUrl = `data:image/png;base64,${result.image}`;

                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (!user) return;

                const blob = await fetch(finalUrl).then((res) => res.blob());
                const filename = `${user.id}_${Date.now()}.jpg`;

                const { error: uploadError } = await supabase.storage
                    .from("results")
                    .upload(filename, blob, {
                        contentType: "image/jpeg",
                        upsert: false,
                    });

                if (uploadError) {
                    message.error("Չհաջողվեց վերբեռնել արդյունքը։");
                    return;
                }

                const {
                    data: { publicUrl },
                } = supabase.storage.from("results").getPublicUrl(filename);

                const { data: inserted, error: insertError } = await supabase
                    .from("results")
                    .insert([
                        {
                            user_id: user.id,
                            image_url: publicUrl,
                            is_public: false,
                        },
                    ])
                    .select();

                if (insertError || !inserted?.[0]) {
                    message.error("DB insert սխալ։");
                    return;
                }

                const insertedId = inserted[0].id;

                dispatch(
                    addResult({
                        image_url: publicUrl,
                        created_at: new Date().toISOString(),
                    })
                );

                setResultUrl(finalUrl);
                setLatestResult({ url: finalUrl, id: insertedId });
                setShowModal(true);

                message.success("✅ Արդյունքը պահպանվել է քո պրոֆիլում։");
            } else {
                message.error("❌ FaceSwap չհաջողվեց։");
            }
        } catch (err) {
            console.error("FaceSwap error:", err);
            message.error("❌ Սերվերի կամ API-ի սխալ");
        }

        setLoading(false);
    };

    if (!template) {
        return (
            <div style={{ padding: 40 }}>
                <Title level={3}>
                    🙃 Template ընտրված չէ կամ գոյություն չունի։
                </Title>
            </div>
        );
    }

    return (
        <div style={{ padding: 40 }}>
            <Title level={2}>🤖 FaceSwap</Title>
            <Button type="primary" onClick={() => navigate("/profile")}>
                Տեսնել իմ Պրոֆիլը
            </Button>

            <Image
                src={template.url}
                alt={template.title}
                width={300}
                style={{ borderRadius: 10, marginBottom: 20 }}
            />

            <Upload
                beforeUpload={beforeUpload}
                showUploadList={false}
                accept="image/*"
            >
                <Button icon={<UploadOutlined />}>Վերբեռնել դեմքի նկար</Button>
            </Upload>

            {userImage && (
                <div style={{ marginTop: 20 }}>
                    <Image
                        src={URL.createObjectURL(userImage)}
                        alt="User"
                        width={200}
                        style={{ borderRadius: 10 }}
                    />
                </div>
            )}

            <Button
                type="primary"
                icon={<SwapOutlined />}
                onClick={handleSwap}
                style={{ marginTop: 20 }}
                loading={loading}
            >
                Փոխել դեմքը
            </Button>

            {resultUrl && (
                <div style={{ marginTop: 30 }}>
                    <Title level={4}>Արդյունք</Title>
                    <Image src={resultUrl} alt="Result" width={300} />
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        style={{ marginTop: 10 }}
                        onClick={async () => {
                            const response = await fetch(resultUrl);
                            const blob = await response.blob();
                            const blobUrl = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = blobUrl;
                            link.download = "faceswap_result.jpg";
                            link.click();
                            URL.revokeObjectURL(blobUrl);
                        }}
                        block
                    >
                        Ներբեռնել
                    </Button>
                </div>
            )}

            <Modal
                open={showModal}
                onCancel={() => setShowModal(false)}
                title="🫂 Ցանկանու՞մ ես քո swap-ը հրապարակել Explore-ում"
                footer={[
                    <Button key="no" onClick={() => setShowModal(false)}>
                        Ոչ, թող մնա միայն իմ պրոֆիլում
                    </Button>,
                    <Button
                        key="yes"
                        type="primary"
                        onClick={async () => {
                            const { error } = await supabase
                                .from("results")
                                .update({ is_public: true })
                                .eq("id", latestResult?.id);

                            if (error) {
                                message.error("❌ Չհաջողվեց դարձնել հրապարակային");
                            } else {
                                message.success("🌍 Արդյունքը հրապարակվեց Community-ում");
                            }

                            setShowModal(false);
                        }}
                    >
                        Այո՛, հրապարակիր
                    </Button>,
                ]}
            >
                <p>
                    Եթե հաստատում ես, քո արդյունքը հասանելի կլինի բոլոր այցելուներին
                    Explore բաժնում։
                </p>
                <img
                    src={latestResult?.url}
                    alt="preview"
                    style={{ width: "100%", borderRadius: 10, marginTop: 12 }}
                />
            </Modal>
        </div>
    );
}
