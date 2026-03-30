const base64Pixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

async function testScan() {
  try {
    const response = await fetch("http://localhost:3000/api/trpc/food.analyzeFood", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "0": {
          "json": {
            "imageData": base64Pixel
          }
        }
      })
    });
    
    const text = await response.text();
    console.log("Status:", response.status);
    console.log("Response:", text);
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

testScan();
