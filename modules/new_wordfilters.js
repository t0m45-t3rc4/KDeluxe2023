
{
  const targetNode = document.getElementById("delform");
  const observers = [];
  const config = { attributes: false, childList: true, subtree: false };

  const wordFilters = [
    {
      "cssRaw": ".robert {\n   animation: robert ease-in 500ms infinite alternate;\n   font-weight:bold;\n}\n @keyframes robert {\n   from {\n     background-color: green;\n     color: #fff;\n  }\n   to {\n     background-color: #fff;\n     color: green;\n  }\n}\n .maxiu {\n   background-color: red;\n   color: #ff0;\n}\n .deluxe {\n   color: #D5AD6D;\n   background: -webkit-linear-gradient(transparent, transparent), -webkit-linear-gradient(top, rgba(213,173,109,1) 0%, rgba(213,173,109,1) 26%, rgba(226,186,120,1) 35%, rgba(163,126,67,1) 45%, rgba(145,112,59,1) 61%, rgba(213,173,109,1) 100%);\n   background: -o-linear-gradient(transparent, transparent);\n   -webkit-background-clip: text;\n   -webkit-text-fill-color: transparent;\n}\n",
      "regexExp": "#robercik",
      "regexFlag": "g",
      "replaceHTML": "\"\u003cspan class=\"robert\"\u003eBRAWO ROBERCIK\u003c/span\u003e\""
    },
    {
      "cssRaw": "",
      "regexExp": "#R",
      "regexFlag": "g",
      "replaceHTML": "\u003cspan class=\"maxiu\" \"\u003e#R REVOLUTION\u003c/span\u003e"
    },
    {
      "cssRaw": "",
      "regexExp": "#deluxe",
      "regexFlag": "g",
      "replaceHTML": "\u003cspan class=\"deluxe\" \"\u003eKarachan Deluxe 2023\u003c/span\u003e"
    },
    { "cssRaw": ".hogowanie-joya {\n   background: linear-gradient(to right, #00FF00, #FFFF00, #FF0000);\n   background-size: 300% 100%;\n   background-clip: text;\n   -webkit-background-clip: text;\n   color: transparent;\n   animation: gradient-animation 3s linear infinite;\n}\n @keyframes gradient-animation {\n   0% {\n     background-position: 0% 50%;\n  }\n   50% {\n     background-position: 100% 50%;\n  }\n   100% {\n     background-position: 0% 50%;\n  }\n}\n", "regexExp": "\\bhogowanie\\sjoya\\b", "regexFlag": "i", "replaceHTML": "\u003cspan class=\"hogowanie-joya\"\u003eHOGOWANIE JOYA\u003c/span\u003e" }
  ];
  const wordFilterUrls = [
    "https://raw.githubusercontent.com/t0m45-t3rc4/KDeluxe2023/main/wordfilters/kdeluxe.json",
    "https://raw.githubusercontent.com/t0m45-t3rc4/KDeluxe2023/main/wordfilters/gg.json",
  ];


  var postFunction = () => { };
  function addObserver(node, callback) {
    var observer = new MutationObserver(callback);
    observer.observe(node, config);
    observers.push(observer);
  }

  function boardCallback(mutationList) {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (node.className === "board") {
            observeThreads(node);
          }
        }
      }
    }
  };
  function postCallback(mutationList) {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          console.log("post found");

          if (node.classList.contains("postContainer")) {
            postFunction(node);
          }
        }
      }
    }
  };

  function observeThreads(page) {
    const threads = page.getElementsByClassName("thread");
    Array.from(threads).forEach(thread => {
      const posts = thread.getElementsByClassName("postMessage");

      Array.from(posts).forEach(post => postFunction(post));

      addObserver(thread, postCallback, config);
    });
  }

  function run(inputFunction) {
    postFunction = inputFunction;
    observeThreads(document.getElementsByClassName("board")[0]);
    addObserver(targetNode, boardCallback, config);
  }

  async function fetchDataFromAPI(apiEndpoint) {
    try {
      const response = await fetch(apiEndpoint);
      const data = await response.json();

      return data;
    } catch (e) {
      console.log(e);
    }
  }

  async function fetchWordFilters() {
    const promises = wordFilterUrls.map(async (url) => {
      const filters = await fetchDataFromAPI(url);
      return filters;
    });
    const filtersArrays = await Promise.all(promises);

    const filters = filtersArrays.flat();
    wordFilters.push(...filters);
  }

  function initClasses() {
    wordFilters.forEach((wordFilter) => {
      if (wordFilter.cssRaw.length > 0) {
        var style = document.createElement("style");
        var css = wordFilter.cssRaw;

        style.innerHTML = css;

        document.head.appendChild(style);
      }
    });
  }

  function replaceText(post) {
    let res = post;
    wordFilters.forEach((wordFilter) => {
      const regExp = new RegExp(wordFilter.regexExp, wordFilter.regexFlag);
      if (regExp.test(res)) {
        res = res.replace(regExp, wordFilter.replaceHTML);
      }
    }
    );
    return res;
  }

  function wrapNonAnchorElements(parentElement, tag) {
    const childNodes = parentElement.childNodes;

    // Create a new array to store non-anchor elements and text nodes
    const nonAnchorElements = [];

    // Iterate over all child nodes and add non-anchor elements and text nodes to the array
    childNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'A' && node.tagName !== 'BR' && node.tagName !== 'DIV') {
        nonAnchorElements.push(node);
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
        nonAnchorElements.push(node);
      }
    });

    // Wrap non-anchor elements and text nodes in divs with the specified tag
    nonAnchorElements.forEach(node => {
      const wrapper = document.createElement(tag);
      wrapper.className = "wrapper-span";

      parentElement.insertBefore(wrapper, node);
      wrapper.appendChild(node);
    });
  }
  function applyWordFilters(post) {
    wrapNonAnchorElements(post, 'span');
    const posts = post.getElementsByClassName('wrapper-span');

    Array.from(posts).forEach(post => {
      // Create a copy of the element
      const copy = post.cloneNode(true);

      // Replace the text of the copy
      copy.innerHTML = replaceText(copy.innerHTML);

      // Replace the original element with the copy, preserving its attached events
      post.parentNode.replaceChild(copy, post);
    })

  }

  async function main() {
    await fetchWordFilters();
    initClasses();
    run(applyWordFilters);
  }

  main();
}
