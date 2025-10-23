let os = "Unknown OS";

if (navigator.userAgentData) {
  const platform = navigator.userAgentData.platform.toLowerCase();
  if (platform.includes("windows")) os = "Windows";
  else if (platform.includes("linux")) os = "Linux";
  else { os = "Windows" }
}

const osSvg = document.getElementsByClassName("os")[0]
const osName = document.getElementsByClassName("os-name")[0]
const osSvg1 = document.getElementsByClassName("os")[1]
const osName1 = document.getElementsByClassName("os-name")[1]

window.onload(reload())

function reload() {
    if ("Windows" == os) {
        osSvg.src = "./assets/images/windows.svg";
        osName.innerText = os;
        osSvg1.src = "./assets/images/windows.svg";
        osName1.innerText = os;
    }

    if ("Linux" == os) {
        osSvg.src = "./assets/images/linux.svg";
        osName.innerText = os;
        osSvg1.src = "./assets/images/linux.svg";
        osName1.innerText = os;
    }
}