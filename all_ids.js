const canvases = document.querySelector("#canvases");

const barcode = document.querySelector("#barcode");
const idBase = document.createElement("img");
idBase.src = "idBase.png";

let emailData;
let sData;

(async ()=>{
    const openSans = new FontFace("OpenSans", "url(OpenSans.ttf)");
    await openSans.load();
    document.fonts.add(openSans);
    fetch("emailData.json").then(r => r.json()).then(d => {emailData = d;}).then(
        fetch("2025-09-14.json").then(r => r.json()).then(d => {sData = d.students.filter(s => s.id > 138000000 && s.school.includes("Cupertino High School") 
            && s.image[0] != "https://asset-cdn.schoology.com/sites/all/themes/schoology_theme/images/user-default.svg")})
        .then(()=>{for (let i in sData) {
            let s = sData[i];
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const scale = window.devicePixelRatio || 1;

            w = 350;
            h = w*213/338;
            canvas.width = w*1.2;
            canvas.height = h*1.2;
            canvas.style.width = w+"px";
            canvas.style.height = h+"px";
            updateId(ctx, s.name);
            canvases.appendChild(canvas);
        }})
    )
})();

fetch("emailData.json").then(r => r.json()).then(d => {emailData = d;})

fetch("2025-09-14.json").then(r => r.json()).then(d => {sData = d.students.filter(s => s.id > 138000000 && s.school.includes("Cupertino High School") 
    && s.image[0] != "https://asset-cdn.schoology.com/sites/all/themes/schoology_theme/images/user-default.svg")})
.then(()=>{for (let i in sData) {
    let s = sData[i];
    let id = nameToId(s.name);
    if (id === undefined) continue;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const scale = window.devicePixelRatio || 1;

    w = 338;
    h = w*213/338;
    canvas.width = w*1.2;
    canvas.height = h*1.2;
    canvas.style.width = w+"px";
    canvas.style.height = h+"px";
    updateId(ctx, s.name, id);
    canvases.appendChild(canvas);
}});

function updateId(ctx, name, id) {
    if (!sData) return;
    for (let s of sData) {
        if (name.split(" ").length === 1 ? s.name.toLowerCase().split(" ")[0] === name.toLowerCase() : s.name.toLowerCase() === name.toLowerCase()) {
            let pfpImage = document.createElement("img");
            pfpImage.src = s.image[0];
            pfpImage.addEventListener("load", ()=>{
                JsBarcode("#barcode", id, {
                    format: "CODE39",
                    width: 2.48*w/676,
                    height: 55*w/676,
                    displayValue: false,
                    margin: 0,
                });
                barcode.addEventListener("load", ()=>{
                    ctx.drawImage(idBase, 0, 0, w, h);
                    ctx.drawImage(pfpImage, w*0.718, h*0.1417, w*0.23675, h*0.47003);

                    ctx.textAlign = "left";
                    ctx.font = 20.83 * w/676 + "px OpenSans";
                    ctx.fillStyle = "#000000";
                    ctx.fillText("Grade: 9", w*0.22, h*0.9512); 
                    ctx.fillText("Student ID: " + id, w*0.4725, h*0.9512); 

                    ctx.textAlign = "center";
                    ctx.font = 28 * w/676 + "px OpenSans";
                    ctx.fillText(s.name, w*0.49, h*0.72);

                    ctx.drawImage(barcode, w*0.226, h*0.75);
                    ctx.font = "bold " + 33.2 * w/676 + "px 'Arial Black'";
                    ctx.scale(0.9, 1);
                    ctx.fillText("2025-2026", w*0.44/0.9, h*0.61);
                    ctx.resetTransform();
                })
            })
            break;
        }
    }
}

function nameToId(name) {
    let ct = 0;
    for (let i = sData.length-1; i >= 0; i--) {
        let s = sData[i];
        if (s.name.toLowerCase() === name.toLowerCase()) {
            let hex = parseInt(s.image[0].split("_").at(-1).substring(0, 13), 16);
            let oHex = hex - 1843008215449600;

            let last3s = [];
            for (let j of emailData) {
                if (j.n === s.name) {
                    last3s.push(parseInt(j.e.substring(j.e.length-4, j.e.length-1)));
                }
            }
            if (last3s.length === 0) return;

            let last3;
            if (last3s.length >= 2) {
                let est = oHex > 152000000 ? (0.00001771831283195229 * oHex) + 5248483.381099993 : (0.000011041115883894443 * oHex) + 5249958.860595227;
                let dists = [];
                for (let l of last3s) {
                    dists.push(Math.min(Math.abs(5250000 + l - est), Math.abs(5251000 + l - est)));
                }
                last3 = last3s[dists.indexOf(Math.min(...dists))];
            } else {
                last3 = last3s[0];
            }

            return (oHex > 94100000 ? 5251000 : 5250000) + last3;
        }
    }
}

//document.querySelector("#submit").addEventListener("click", ()=>{});