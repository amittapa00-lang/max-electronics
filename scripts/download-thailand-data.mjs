import fs from "fs";
import path from "path";

const urls = {
  provinces:
    "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json",

  amphures:
    "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_amphure.json",

  tambons:
    "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_tambon.json",
};

const outputDir =
  path.join(
    process.cwd(),
    "public",
    "thailand"
  );

if (
  !fs.existsSync(outputDir)
) {
  fs.mkdirSync(outputDir, {
    recursive: true,
  });
}

for (const [name, url] of Object.entries(
  urls
)) {
  const res =
    await fetch(url);

  const text =
    await res.text();

  fs.writeFileSync(
    path.join(
      outputDir,
      `${name}.json`
    ),
    text,
    "utf8"
  );

  console.log(
    `✓ ${name}.json`
  );
}

console.log(
  "\nดาวน์โหลดข้อมูลสำเร็จ"
);