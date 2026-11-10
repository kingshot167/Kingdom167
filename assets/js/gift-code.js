(function () {
  "use strict";

  const API_URL = "https://kingshot-giftcode.centurygame.com/api/gift_code";
  // This value is published in the third-party API notes and in the public client.
  // It is not a secret and must not be used to secure this website.
  const CLIENT_KEY = "mN4!pQs6JrYwV9";

  function md5(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    const bitLength = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (let i = 0; i < 8; i += 1) bytes.push(Math.floor(bitLength / (2 ** (8 * i))) & 0xff);

    const shifts = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
    const constants = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0);
    let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

    for (let offset = 0; offset < bytes.length; offset += 64) {
      const words = [];
      for (let i = 0; i < 16; i += 1) {
        const p = offset + i * 4;
        words[i] = (bytes[p] | (bytes[p + 1] << 8) | (bytes[p + 2] << 16) | (bytes[p + 3] << 24)) >>> 0;
      }
      let a = a0, b = b0, c = c0, d = d0;
      for (let i = 0; i < 64; i += 1) {
        let f, g;
        if (i < 16) { f = (b & c) | (~b & d); g = i; }
        else if (i < 32) { f = (d & b) | (~d & c); g = (5 * i + 1) % 16; }
        else if (i < 48) { f = b ^ c ^ d; g = (3 * i + 5) % 16; }
        else { f = c ^ (b | ~d); g = (7 * i) % 16; }
        const sum = (a + f + constants[i] + words[g]) >>> 0;
        const shift = shifts[i];
        const rotated = ((sum << shift) | (sum >>> (32 - shift))) >>> 0;
        const next = (b + rotated) >>> 0;
        a = d; d = c; c = b; b = next;
      }
      a0 = (a0 + a) >>> 0; b0 = (b0 + b) >>> 0; c0 = (c0 + c) >>> 0; d0 = (d0 + d) >>> 0;
    }

    function littleEndianHex(word) {
      let out = "";
      for (let i = 0; i < 4; i += 1) out += ((word >>> (i * 8)) & 0xff).toString(16).padStart(2, "0");
      return out;
    }
    return littleEndianHex(a0) + littleEndianHex(b0) + littleEndianHex(c0) + littleEndianHex(d0);
  }

  function friendlyResult(data) {
    const labels = {
      20000: ["success", "Code redeemed. Check the character’s in-game mail for the reward."],
      40005: ["failure", "The code has reached its redemption limit."],
      40007: ["failure", "The gift code has expired."],
      40008: ["failure", "This player has already claimed this code."],
      40010: ["failure", "This player does not meet the code’s eligibility requirements."],
      40011: ["failure", "A reward of this type has already been claimed."],
      40014: ["failure", "The gift code was not found. Check its spelling and capitalization."],
      40019: ["failure", "The service says this player has redeemed too recently. Try again later."],
      40020: ["failure", "The player ID and kingdom may not match. Check both values."]
    };
    const code = Number(data && data.err_code);
    return labels[code] || ["failure", (data && (data.msg || data.message)) || "The service returned a response that needs review."];
  }

  const form = document.getElementById("gift-form");
  const button = document.getElementById("redeem-button");
  const status = document.getElementById("gift-status");
  const result = document.getElementById("gift-result");
  const badge = document.getElementById("result-badge");
  const summary = document.getElementById("result-summary");
  const raw = document.getElementById("result-raw");
  const codesMeta = document.getElementById("codes-meta");
  const codesList = document.getElementById("available-codes");

  function formatDate(value) {
    if (!value) return "No expiry announced";
    const numeric = typeof value === "number" || /^\d+(\.\d+)?$/.test(String(value));
    const timestamp = numeric ? Number(value) * (Number(value) < 100000000000 ? 1000 : 1) : value;
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "Expiry: " + value;
    return "Expires " + new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }).format(date) + " (UTC)";
  }

  async function loadCodes() {
    try {
      const response = await fetch("/Kingdom167/assets/data/giftcodes.json", { cache: "no-cache" });
      if (!response.ok) throw new Error("Code list unavailable");
      const data = await response.json();
      if (!Array.isArray(data.codes)) throw new Error("Unexpected code-list format");
      codesList.replaceChildren();
      if (data.updated_at) {
        const updated = new Date(data.updated_at);
        codesMeta.textContent = "Active codes · list last changed " + (Number.isNaN(updated.getTime()) ? data.updated_at : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(updated) + " UTC");
      } else {
        codesMeta.textContent = "Active codes · waiting for the first successful scheduled update";
      }
      if (data.codes.length === 0) {
        const empty = document.createElement("p");
        empty.className = "codes-empty";
        empty.textContent = "No codes are loaded yet. You can still enter a code manually below.";
        codesList.appendChild(empty);
        return;
      }
      data.codes.forEach(function (item) {
        if (!item || typeof item.code !== "string") return;
        const row = document.createElement("div");
        row.className = "available-code";
        const main = document.createElement("div");
        main.className = "available-code-main";
        const name = document.createElement("span");
        name.className = "available-code-name";
        name.textContent = item.code;
        const expiry = document.createElement("span");
        expiry.className = "available-code-expiry";
        expiry.textContent = formatDate(item.expires_at);
        const use = document.createElement("button");
        use.className = "use-code-button";
        use.type = "button";
        use.textContent = "Use code";
        use.addEventListener("click", function () {
          document.getElementById("gift-code").value = item.code;
          document.getElementById("gift-code").focus();
          document.getElementById("gift-form").scrollIntoView({ behavior: "smooth", block: "center" });
        });
        main.append(name, expiry);
        row.append(main, use);
        codesList.appendChild(row);
      });
    } catch (_) {
      codesMeta.textContent = "The code list could not be loaded right now.";
      codesList.replaceChildren();
      const fallback = document.createElement("p");
      fallback.className = "codes-empty";
      fallback.textContent = "You can still enter a gift code manually below.";
      codesList.appendChild(fallback);
    }
  }

  loadCodes();

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const fid = String(formData.get("fid")).trim();
    const kid = String(formData.get("kid")).trim();
    const cdk = String(formData.get("cdk")).trim();
    const time = String(Math.floor(Date.now() / 1000));
    const signText = "cdk=" + cdk + "&fid=" + fid + "&kid=" + kid + "&time=" + time + CLIENT_KEY;
    const params = new URLSearchParams({ sign: md5(signText), fid: fid, cdk: cdk, kid: kid, time: time });

    status.hidden = false;
    status.dataset.kind = "info";
    status.textContent = "Sending the redemption request…";
    result.hidden = true;
    button.disabled = true;
    button.querySelector("span").textContent = "Submitting…";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: params.toString()
      });
      const responseText = await response.text();
      let data;
      try { data = JSON.parse(responseText); }
      catch (_) { data = { response: responseText }; }

      result.hidden = false;
      badge.className = "result-badge";
      if (data && data.err_code !== undefined) {
        const message = friendlyResult(data);
        badge.textContent = Number(data.err_code) === 20000 ? "SUCCESS" : "ERROR " + data.err_code;
        badge.classList.add(message[0]);
        summary.textContent = message[1];
      } else if (response.ok) {
        badge.textContent = "RESPONSE RECEIVED";
        summary.textContent = "The service replied, but its response format was not recognized. Review the details below.";
      } else {
        badge.textContent = "HTTP " + response.status;
        badge.classList.add("failure");
        summary.textContent = "The service returned an HTTP error. Review the response details below.";
      }
      raw.textContent = JSON.stringify(data, null, 2);
      status.textContent = "Request completed with HTTP " + response.status + ".";
    } catch (error) {
      status.dataset.kind = "error";
      status.textContent = "Could not read a response from the redemption service. This may be a network or browser cross-origin restriction; check the game’s official redemption page before trying again, because the request may have reached the service.";
      result.hidden = false;
      badge.className = "result-badge failure";
      badge.textContent = "NO RESPONSE";
      summary.textContent = "The redemption outcome is unknown. Do not resubmit until you have checked the game or official gift-code page, because the first request may have reached the server.";
      raw.textContent = "No readable API response was received.";
    } finally {
      button.disabled = false;
      button.querySelector("span").textContent = "Redeem gift code";
    }
  });
})();
