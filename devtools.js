// Can use
// chrome.devtools.*
// chrome.extension.*

// Create a tab in the devtools area

chrome.devtools.panels.create(
  "DemoPanel",
  "toast.png",
  "panel.html",
  function (panel) {}
);

let allStyles = {};
let changedStyles = {};
let notEqualStyles = {};
let chaged = {};
let test = 1;
let testBool = false;
let currentSidebar;

let allStylesChanged = {};

const runStylesRender = async () => {
  const innerHTML = await new Promise((resolve) => {
    chrome.devtools.inspectedWindow.eval(
      "$0.innerHTML",
      (result, isException) => {
        resolve(isException ? null : result);
      }
    );
  });

  if (innerHTML && !Object.keys(allStyles).length) {
    const allStyleElements = await new Promise((resolve) => {
      chrome.devtools.inspectedWindow.eval(
        "Object.keys(window.getComputedStyle($0))",
        (result, isException) => {
          resolve(isException ? null : result);
        }
      );
    });

    if (allStyleElements) {
      for (const styleElementName of allStyleElements) {
        const styleElementValue = await new Promise((resolve) => {
          chrome.devtools.inspectedWindow.eval(
            `window.getComputedStyle($0).getPropertyValue('${styleElementName}')`,
            (result, isException) => {
              resolve(isException ? null : result);
            }
          );
        });

        if (styleElementValue) {
          allStyles[styleElementName] = styleElementValue;
        }
      }
    }
  }
  currentSidebar.setObject({
    Styles: allStyles,
    changedStyles: changedStyles,
    notEqualStyles,
  });
};

chrome.devtools.panels.elements.createSidebarPane(
  "Style Changes",
  function (sidebar) {
    currentSidebar = sidebar;
    chrome.devtools.panels.elements.onSelectionChanged.addListener(async function () {
      allStyles = {};
      changedStyles = {};
      notEqualStyles = {};
      await runStylesRender();


    });
  }
);

setInterval(async () => {
  const allStyleElements = await new Promise((resolve) => {
    chrome.devtools.inspectedWindow.eval(
      "Object.keys(window.getComputedStyle($0))",
      (result, isException) => {
        resolve(isException ? null : result);
      }
    );
  });

  if (allStyleElements) {
    for (const styleElementName of allStyleElements) {
      const styleElementValue = await new Promise((resolve) => {
        chrome.devtools.inspectedWindow.eval(
          `window.getComputedStyle($0).getPropertyValue('${styleElementName}')`,
          (result, isException) => {
            resolve(isException ? null : result);
          }
        );
      });

      if (styleElementValue) {
        changedStyles[styleElementName] = styleElementValue;

        for (const key in changedStyles) {
          if (changedStyles[key] !== allStyles[key]) {
            notEqualStyles[key] = changedStyles[key];
          }
        }
      }
    }
  }

  runStylesRender();
}, 5000);
