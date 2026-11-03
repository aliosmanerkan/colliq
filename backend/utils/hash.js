import crypto from "node:crypto";

export default function hashPassword(mail, password) {
    let hash = crypto.createHmac("sha512", mail);
    hash.update(password);
    let str = "";
    str += hash.digest("hex");
    return str;
}
