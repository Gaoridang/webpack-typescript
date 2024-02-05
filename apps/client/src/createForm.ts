import { inputTypes } from "./constants";
import createElement from "./createElement";
import { createLabel } from "./createLabel";
import { createDynamicSection } from "./createSection";

export function createForm() {
  const inputs = inputTypes.map((inputType) => {
    const inputEl = createElement("input", {
      className: inputType.name,
      id: inputType.name,
      type: inputType.type || "text",
      required: true,
      attributes: { name: inputType.name, placeholder: inputType.placeholder, autocomplete: "off" },
    });

    if (inputType.name === "urls") {
      return createLabel(inputType.kr, inputType.name, inputEl);
    }

    return createLabel(inputType.kr, inputType.name, inputEl);
  });
  // FIXME: 엔터 누르면 커리어 인풋이 추가됨(?)
  // const careerSection = createSection("career", [textAreas[0]]);

  const aboutMeContainer = createElement("div", {
    className: "about-me",
    children: [...inputs.slice(0, 5)],
  });

  const urlSection = createDynamicSection("url", "포트폴리오", "input");
  const careerSection = createDynamicSection("career", "경력");
  const projectSection = createDynamicSection("project", "프로젝트");
  const careerContainer = createElement("div", {
    className: "careers",
    children: [careerSection, projectSection, urlSection],
  });

  const submitButton = createElement("button", {
    className: "submit-button",
    type: "submit",
    text: "PDF로 변환하기",
  });

  const form = createElement("form", {
    className: "form",
    children: [aboutMeContainer, careerContainer, submitButton],
    attributes: { action: "#", method: "POST" },
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let formDataHtml = `<div class='form-data'>`;

    inputTypes.forEach((inputType) => {
      const inputEl = document.querySelector(`input[name="${inputType.name}"]`) as HTMLInputElement;
      if (inputEl) {
        formDataHtml += `
          <div class=${inputType.name}-container>
            <h2>${inputType.name}</h2>
            <p>${inputEl.value}</p>
          </div>
        `;
      }
    });

    formDataHtml += "</div>";

    console.log(formDataHtml);

    try {
      const response = await fetch("http://localhost:5001/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ htmlContent: formDataHtml }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");
      // pdf download url
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const downloadLink = createElement("a") as HTMLAnchorElement;
      downloadLink.href = downloadUrl;
      downloadLink.download = "이력서.pdf";

      document.body.appendChild(downloadLink);
      downloadLink.click();

      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error generating PDF: ", error);
    }
  });

  return form;
}
