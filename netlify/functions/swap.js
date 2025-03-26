export async function handler(event) {
    try {
        const { source_image, target_image } = JSON.parse(event.body);

        const response = await fetch("https://api.segmind.com/v1/faceswap-v2", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.SEGMIND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                source_image,
                target_image,
            }),
        });

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error("❌ Error in function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Something went wrong." }),
        };
    }
}