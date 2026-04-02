import { setFailed, info, getInput } from "@actions/core";
import fs from "fs";
import path from "path";

async function run() {
  info("Starting BuiltByBit Release Publisher...");
  try {
    const apiToken = getInput("api_token");
    const resourceId = getInput("resource_id");
    const apiUrl = getInput("api_url");

    const version = getInput("version");
    const filePath = getInput("file");

    const postUpdate = getInput("post_update") === "true";
    const title = getInput("title") || "";
    const message = getInput("message") || "";

    if (!fs.existsSync(filePath)) {
      setFailed(`File not found at path: ${filePath}`);
      return;
    }

    info(`Reading file: ${filePath}`);

    const fileBuffer = fs.readFileSync(filePath);
    const base64 = fileBuffer.toString("base64");
    const fileName = path.basename(filePath);

    const payload = {
      resource_id: Number(resourceId),
      version_name: version,
      file: {
        name: fileName,
        data: base64,
      },
    };

    if (postUpdate) {
      if (!title || !message) {
        setFailed("Title and message are required when post_update is true.");
        return;
      }
      payload.update = {
        post: true,
        title: title,
        message: message,
      };
    }

    info("Uploading to BuiltByBit...");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    info(`Response status: ${response.status}`);

    if (!response.ok) {
      setFailed(`API Error: ${response.status}\n${responseText}`);
      return;
    }

    info("✅ Version successfully published to BuiltByBit!");
  } catch (error) {
    setFailed(error.message);
  }
}

run();
