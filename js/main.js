// List of the XML files to be processed.
const XMLFiles = [
  "/xml/arlesmer.xml",
  "/xml/arlestat.xml",
  "/xml/brigarmi.xml",
  "/xml/colomaga.xml",
  "/xml/amanriva.xml",
  "/xml/diveacqu.xml",
  "/xml/corrbuon.xml",
  "/xml/dottvolt.xml",
  "/xml/franvene.xml",
  "/xml/granbasi.xml",
  "/xml/munimarc.xml",
  "/xml/nascondi.xml",
  "/xml/litiinga.xml",
  "/xml/respapol.xml",
  "/xml/quatarle.xml",
  "/xml/travarle.xml",
  "/xml/convsmer.xml",
  "/xml/cortones.xml",
  "/xml/dispnobi.xml",
  "/xml/onorpove.xml",
  "/xml/gazznoti.xml",
  "/xml/lavanobi.xml",
  "/xml/maggglor.xml",
  "/xml/nascarle.xml",
  "/xml/arcainca.xml",
  "/xml/disgpant.xml",
  "/xml/fortdisg.xml",
  "/xml/magipiet.xml",
  "/xml/metaarle.xml",
  "/xml/ingafort.xml",
  "/xml/spergiur.xml",
  "/xml/sansone.xml",
  "/xml/scavstec.xml",
  "/xml/smerodia.xml",
  "/xml/smerspir.xml"
];

var CETEIcean;

const Comedig = {
  works: [],
  agents: [],

  // everything starts here, with the processing of the XML files.
  async init() {
    for (let xmlFile of XMLFiles) {
      console.log(xmlFile);
      await this.processXmlFile(xmlFile);
    }

    await this.importPeople();

    //this.populateMenu();

    this.maybeShowWork();
    this.maybeShowAgent();

    this.createWorksPage();

  },

  // Here it processes a single XML file.
  async processXmlFile(xmlFile) {
    const response = await fetch(xmlFile);
    const xmlData = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlData, "text/xml");

    this.processDoc(xmlFile, doc);
  },

  //a query xpath is executed using a TEI ns
  runXPath(xmlDoc, xpath, node) {
    return xmlDoc.evaluate(xpath, node, ns => {
          if (ns == "tei") return "http://www.tei-c.org/ns/1.0";
    });
  },

  //Extract work and castlist elements from a XML doc
  processDoc(xmlFile, xmlDoc) {

    const work = {
      url: new URL(xmlFile, window.location),
      xmlDoc,
      title: "",
      descr: "",
      versions: [],
      facsimiles: []
    };


    try {
      work.title = this.runXPath(xmlDoc, "/tei:teiCorpus/tei:teiHeader//tei:title", xmlDoc).iterateNext().textContent;
    } catch (e) {
      console.error("No teiCorpus found!");
      return;
    }

    // get more descriptive metadata from TEI header

    try {
      work.descr = this.runXPath(xmlDoc, "/tei:teiCorpus/tei:teiHeader//tei:sourceDesc", xmlDoc).iterateNext().innerHTML;
    } catch (e) {
      work.descr = "info to be added"
    }

    const teiResult = this.runXPath(xmlDoc, "/tei:teiCorpus/tei:TEI", xmlDoc);
    for (let a = teiResult.iterateNext(); a; a = teiResult.iterateNext()) {
      work.versions.push(a);

      const language = this.runXPath(xmlDoc, ".//tei:language", a).iterateNext().textContent;
      const facsimileResult = this.runXPath(xmlDoc, ".//tei:facsimile//tei:graphic", a);
      const facsimile = { language, images: [] };
      for (let i = facsimileResult.iterateNext(); i; i = facsimileResult.iterateNext()) {
        facsimile.images.push("/comedig" + i.getAttribute("url"));
      }
      work.facsimiles.push(facsimile);
    }

    this.works.push(work);
  },

  // Let's populate the menu with the list of works.
  /*populateMenu() {
    this.populateMenuWorks();
    this.populateMenuAgents();
  },

  populateMenuWorks() {
    const elm = document.getElementById("menuWorks");
    for (let workId in this.works) {
      const work = this.works[workId];

      const elmLi = document.createElement("li");
      const elmA = document.createElement("a");
      elmA.setAttribute("class", "dropdown-item");
      elmA.setAttribute("href", "/work?id=" + workId);
      elmA.textContent = work.title;
      elmLi.appendChild(elmA);
      elm.appendChild(elmLi);
    }
  },*/


  // Function that creates an overview page of works contained in the project

  createWorksPage() {
    if (!location.pathname.startsWith("/opere.html")) {
      return;
    }

    var listWorks = document.getElementById("listWorks");
    for (let workId in this.works) {
      const work = this.works[workId];
      
      var listWorksDiv = document.createElement("div");
      listWorksDiv.setAttribute("class", "titleContainer");
      
      var workTitle = document.createElement("div");
      workTitle.setAttribute("class", "accordion");
      workTitle.textContent = "> "
      workTitle.textContent += work.title;

      

      var workLink = document.createElement("a");
      workLink.setAttribute("href", "/work?id=" + workId);
      workLink.setAttribute("class", "titleContainer");
      workLink.text = "  🔗";
      workTitle.appendChild(workLink);

      var descText = document.createElement("div");
      descText.setAttribute("class", "content");
      descText.innerHTML = work.descr;


      
      
      var downloadSection = document.createElement('p');
      descText.append(downloadSection);


      var xmllink = document.createElement("a");
      xmllink.setAttribute("href", work.url);
      xmllink.setAttribute("download",work.url.pathname.substring(work.url.pathname.lastIndexOf('/')+1));
      xmllink.innerHTML = "Scarica il file TEI-XML";
      
      downloadSection.appendChild(xmllink);

      var leggionline = document.createElement('p');
      var workLinka = document.createElement("a");
      workLinka.setAttribute("href", "/work?id=" + workId);
      workLinka.setAttribute("class", "titleContainer");
      workLinka.text = "Leggi online"
      leggionline.appendChild(workLinka);
      downloadSection.appendChild(leggionline);
    
      
      
      listWorksDiv.appendChild(workTitle);
      listWorksDiv.appendChild(descText);
      listWorks.appendChild(listWorksDiv);



      /*const listWorksLi = document.createElement("li");
      const listWorksA = document.createElement("a");
      listWorksA.setAttribute("href", "/work?id=" + workId);
      listWorksA.textContent = work.title;
      listWorksLi.appendChild(listWorksA);
      listWorks.appendChild(listWorksLi);*/
    }

    var coll = document.getElementsByClassName("accordion");
    var i;
    
    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
      });
    }
  },

  populateMenuAgents() {
    const elm = document.getElementById("menuAgents");
    for (let agentId in this.agents) {
      const agent = this.agents[agentId];

      const elmLi = document.createElement("li");
      const elmA = document.createElement("a");
      elmA.setAttribute("class", "dropdown-item");
      elmA.setAttribute("href", "/agent?id=" + agentId);
      elmA.textContent = agent.name;
      elmLi.appendChild(elmA);
      elm.appendChild(elmLi);
    }
  },

  maybeShowWork() {
    if (!location.pathname.startsWith("/work")) {
      return;
    }

    const urlParam = new URLSearchParams(location.search);
    const workId = urlParam.get("id");
    const work = this.works[workId];

    document.getElementById("workTitle").textContent = work.title;

    const elmTabUl = document.getElementById("tab");
    const elmTabContentUl = document.getElementById("tabContent");

    const elmCompareA = document.getElementById("compareA");
    const elmCompareB = document.getElementById("compareB");

    const showBody = (value, body, bodyPagination)  => {
      const elmPagination = document.getElementById(bodyPagination);
      elmPagination.setAttribute("hidden", "true");

      const elm = document.getElementById(body);
      while (elm.firstChild) elm.firstChild.remove();

      if (value.startsWith("version-")) {
        const versionId = parseInt(value.slice(8), 10);
        CETEIcean.domToHTML5(work.versions[versionId], data => {
          const elm = document.getElementById(body);
          elm.appendChild(data);
          this.createPagination(elm, elmPagination);
        });
        return;
      }

      if (value.startsWith("facsimile-")) {
        const div = document.createElement("div");
        div.setAttribute("id", "openseadragon");
        div.setAttribute("style", "height: 600px;");
        elm.appendChild(div);
        div.scrollIntoView();

        const images = [];
        const facsimileId = parseInt(value.slice(10), 10);
        work.facsimiles[facsimileId].images.forEach(img => images.push({
          type: 'image',
          url:  img
        }));

        OpenSeadragon({
          id: "openseadragon",
          prefixUrl: "https://cdn.jsdelivr.net/npm/openseadragon@2.4/build/openseadragon/images/",
          tileSources: images,
          sequenceMode: true,
        });
        return;
      }
    }
    elmCompareA.onchange = e => showBody(e.target.value, "bodyA", "bodyA-pagination");
    elmCompareB.onchange = e => showBody(e.target.value, "bodyB", "bodyB-pagination");

    work.versions.forEach((version, pos) => {
      const language = this.runXPath(work.xmlDoc, ".//tei:language", version).iterateNext().textContent;

      const li = document.createElement("li");
      li.setAttribute("class", "nav-item");
      li.setAttribute("role", "presentation");

      const button = document.createElement("button");
      button.setAttribute("class", "nav-link");
      button.setAttribute("id", language + "-tab");
      button.setAttribute("data-bs-toggle", "tab");
      button.setAttribute("data-bs-target", "#" + language);
      button.setAttribute("type", "button");
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", language);
      button.setAttribute("aria-selected", "true");
      button.textContent = `Versione in ${translateLanTags(language)}`;
      li.appendChild(button);

      elmTabUl.appendChild(li);

      const div = document.createElement("div");
      div.setAttribute("class", "tab-pane fade show");
      div.setAttribute("id", language);
      div.setAttribute("role", "tabpanel");
      div.setAttribute("aria-labelledby", language + "-tab");

      elmTabContentUl.appendChild(div);

      if (!CETEIcean) {
        CETEIcean = new CETEI();
        CETEIcean.addBehaviors({"tei":{
         "graphic": function(elt) {
           // No images
         },
         "pb": function(elt) {
          const elm = document.createElement("p");
          elm.setAttribute("class", "pageBreak");
          elm.innerText = `- ${elt.getAttribute("n")} -`;
          //elm.setAttribute("style", "color: red");
          return elm;
         },
        }});
      }

      CETEIcean.domToHTML5(version, data => {
        document.getElementById(language).appendChild(data);
      });

      for (let elm of [ elmCompareA, elmCompareB]) {
        const option = document.createElement("option");
        option.textContent = translateLanTags(language);
        option.value = `version-${pos}`;
        elm.appendChild(option);
      }
    });

    work.facsimiles.forEach((facsimile, pos) => {
      for (let elm of [ elmCompareA, elmCompareB]) {
        if (facsimile.images.length > 0) {
          const option = document.createElement("option");
          option.textContent = `Facsimile ${translateLanTags(facsimile.language)}`;
          option.value = `facsimile-${pos}`;
          elm.appendChild(option);
        }
      }
    });

    showBody("version-0", "bodyA", "bodyA-pagination");
    showBody("version-0", "bodyB", "bodyB-pagination");

    const agentWorkList = document.getElementById("agentWorkList");
    this.agents.forEach((agent, agentId) => {
      let match = false;
      agent.seeAlso.forEach(seeAlso => {
        if (seeAlso.pathname === work.url.pathname) match = true;
      });

      if (match) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = agent.name;
        a.href = "/agent?id=" + agentId;
        li.appendChild(a);
        agentWorkList.appendChild(li);
      }
    });
  },

  maybeShowAgent() {
    if (!location.pathname.startsWith("/agent")) {
      return;
    }

    const urlParam = new URLSearchParams(location.search);
    const agentId = urlParam.get("id");
    const agent = this.agents[agentId];

    document.getElementById("agentTitle").textContent = agent.name;

    const agentWorkList = document.getElementById("agentWorkList");
    this.works.forEach((work, workId) => {
      let match = false;
      agent.seeAlso.forEach(seeAlso => {
        if (seeAlso.pathname === work.url.pathname) match = true;
      });

      if (match) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = work.title;
        a.href = "/work?id=" + workId;
        li.appendChild(a);
        agentWorkList.appendChild(li);
      }
    });
  },

  async importPeople() {
    const store = await new Promise(resolve => {
      rdfstore.create({
        communication: {
          parsers: {},
          precedences: ["text/n3", "text/turtle", "application/rdf+xml", "text/html", "application/json"] }
        },
        (err, store) => {
          if (err) {
            alert("Unable to create a RDF store:" + err);
            resolve(null);
            return;
          }

          resolve(store);
        });
    });

    if (!store) return;

    const rdfData = await fetch("/rdf/people.rdf").then(r => r.text());
    await new Promise(resolve => {
      store.load("text/turtle", rdfData, (err, results) => {
        if (err) {
          alert("Unable to import a RDF document:" + err);
        }
        resolve();
      });
    });

    const results = await new Promise(resolve => {
      var query = `
PREFIX foaf:<http://xmlns.com/foaf/0.1/>
PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#>
SELECT ?name ?seeAlso WHERE {
  ?o a foaf:Agent ;
     foaf:name ?name ;
     rdfs:seeAlso ?seeAlso .
}`;
      store.execute(query, (err, results) => {
        if (err) {
          alert("Unable to exec a SPARQL query:" + err);
          resolve([]);
        }
        resolve(results);
      });
    });

    results.forEach(result => {
      const agent = this.agents.find(a => a.name === result.name.value);
      if (agent) {
        agent.seeAlso.push(new URL(result.seeAlso.value, window.location));
        return;
      }

      this.agents.push({
        name: result.name.value,
        seeAlso: [ new URL(result.seeAlso.value, window.location) ],
      });
    });
  },

  createPagination(elm, elmPagination) {
    const pbs = elm.firstChild.getElementsByClassName("pageBreak");
    const pages = pbs.length;
    if (pages <= 1) return;

    elmPagination.removeAttribute('hidden');

    elmPagination.setAttribute("data-page", "0");
    elmPagination.setAttribute("data-elm", elm.id);

    this.showPage(elmPagination, 0);
  },

  prevPagination(elm) {
    const parent = elm.target.parentElement;
    const nextPage = parseInt(parent.getAttribute("data-page"), 10) - 1;
    this.showPage(parent, nextPage);
  },

  nextPagination(elm) {
    const parent = elm.target.parentElement;
    const nextPage = parseInt(parent.getAttribute("data-page"), 10) + 1;
    this.showPage(parent, nextPage);
  },

  showPage(elmPagination, page) {
    elmPagination.setAttribute("data-page", page);
    const elm = document.getElementById(elmPagination.getAttribute("data-elm"));
    const pbs = elm.firstChild.getElementsByClassName("pageBreak");

    if (page <= 0) {
      elmPagination.getElementsByClassName("paginationPrevButton")[0].setAttribute("disabled", "disabled");
    } else {
      elmPagination.getElementsByClassName("paginationPrevButton")[0].removeAttribute("disabled");
    }

    if (page >= pbs.length - 1) {
      elmPagination.getElementsByClassName("paginationNextButton")[0].setAttribute("disabled", "disabled");
    } else {
      elmPagination.getElementsByClassName("paginationNextButton")[0].removeAttribute("disabled");
    }

    elmPagination.getElementsByClassName("pageCount")[0].innerText = `Pagina ${page + 1} su ${pbs.length}`;
    pbs[page].scrollIntoView();
  }
};


/// Function that translates langauge attributes from TEI into Italian
function translateLanTags(lang) {
  if (lang == "Russian") {
    return "russo";
  } else if(lang == "Italian") {
    return "italiano";
  } else if (lang == "German") {
    return "tedesco";
  } else {
    return lang;
  };
};



// populate in-text references with alt text
function addAltText(data) {
    bibrefs = document.getElementsByTagName('bibl')
    Array.from(bibrefs).forEach(function(element) {
        let citekey = element.getAttribute('id');
        console.log(data[citekey]["text"]);
        element.setAttribute("title", data[citekey]["text"].replace(/<[^>]*>?/gm, ''));
    });
    
}

Comedig.init();
