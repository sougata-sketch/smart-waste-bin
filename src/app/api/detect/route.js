export async function POST(request) {
    try {
        const { image } = await request.json();

        if (!image) {
            return Response.json(
                { error: "No image received" },
                { status: 400 }
            );
        }

        // Check API key
        console.log(
            "ROBOFLOW KEY LOADED:",
            !!process.env.ROBOFLOW_API_KEY
        );

        // Remove data URL prefix
        const base64Image = image.replace(
            /^data:image\/\w+;base64,/,
            ""
        );

        // Roboflow V6 model
        const response = await fetch(
            `https://detect.roboflow.com/plastic-detection-dvpju/6?api_key=${process.env.ROBOFLOW_API_KEY}`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded",
                },

                body: base64Image,
            }
        );

        const result = await response.json();

        console.log(
            "ROBOFLOW STATUS:",
            response.status
        );

        console.log(
            "ROBOFLOW RESULT:",
            result
        );

        return Response.json(result);

    } catch (error) {
        console.error(
            "ROBOFLOW ERROR:",
            error
        );

        return Response.json(
            {
                error: "Detection failed",
                details: error.message,
            },
            { status: 500 }
        );
    }
}