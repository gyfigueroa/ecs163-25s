let abFilter = 25;
let width = window.innerWidth;
let height = window.innerHeight;

let boxLeft = 0, boxTop = 0;
let boxMargin = {top: 10, right: 30, bottom: 30, left: 60},
    boxWidth = 400 - boxMargin.left - boxMargin.right,
    boxHeight = 350 - boxMargin.top - boxMargin.bottom;

let heatmapLeft = 400, heatmapTop = 0;  // Positioned to the right of existing charts
let heatmapMargin = {top: 40, right: 30, bottom: 80, left: 80},
    heatmapWidth = 400 - heatmapMargin.left - heatmapMargin.right,
    heatmapHeight = 350 - heatmapMargin.top - heatmapMargin.bottom;

let stringLeft = 0, stringTop = 400;
let stringMargin = {top: 10, right: 30, bottom: 30, left: 60},
    stringWidth = width - stringMargin.left - stringMargin.right,
    stringHeight = height-450 - stringMargin.top - stringMargin.bottom;

function FreqToNum(freq){
    if (freq === "Never"){ return 0; } 
    else if (freq === "Rarely"){ return 1 }
    else if (freq === "Sometimes"){ return 2 }
    else { return 3 };
}

let FreqGenres = {Classical: 0, Country: 0, EDM: 0, Folk: 0, Gospel: 0, "Hip hop": 0, Jazz: 0, Kpop: 0, Latin: 0, Lofi: 0, Metal: 0, Pop: 0, "R&B": 0, Rap: 0, Rock: 0, VideoGame: 0};

let services = ["Spotify", "YouTube Music", "Apple Music", "Pandora"];

d3.csv("data/mxmh_survey_results.csv").then(rawData =>{
    console.log("rawData", rawData);

    rawData.forEach(function(d){
        d.Age = Number(d.Age);
        if (d.Age < 21){
            d.Adult = "Child";
        } else {
            d.Adult = "Adult";
        }
        d.Service = String(d["Primary streaming service"]);
        if (!services.includes(d.Service)){
            d.Service = "Other";
        }
        d.FavGenre = String(d['Fav genre']);
        d.Exploratory = String(d.Exploratory);
        if (d.Exploratory === "Yes"){
            d.Exploratory = "Exploratory";
        }
        if (d.Exploratory === "No"){
            d.Exploratory = "Consistent";
        }
        d.ForeignLang = String(d['Foreign languages']);
        if (d.ForeignLang === "Yes"){
            d.ForeignLang = "Bilungual";
        }
        if (d.ForeignLang === "No"){
            d.ForeignLang = "Monolingual";
        }
        d.FreqClassical = Number(FreqToNum(d['Frequency [Classical]']));
        FreqGenres.Classical += d.FreqClassical;
        d.FreqCountry = Number(FreqToNum(d['Frequency [Country]']));
        FreqGenres.Country += d.FreqCountry;
        d.FreqEDM = Number(FreqToNum(d['Frequency [EDM]']));
        FreqGenres.EDM += d.FreqEDM;
        d.FreqFolk = Number(FreqToNum(d['Frequency [Folk]']));
        FreqGenres.Folk += d.FreqFolk;
        d.FreqGospel = Number(FreqToNum(d['Frequency [Gospel]']));
        FreqGenres.Gospel += d.FreqGospel;
        d.FreqHipHop = Number(FreqToNum(d['Frequency [Hip hop]']));
        FreqGenres["Hip hop"] += d.FreqHipHop;
        d.FreqJazz = Number(FreqToNum(d['Frequency [Jazz]']));
        FreqGenres.Jazz += d.FreqJazz;
        d.FreqKPop = Number(FreqToNum(d['Frequency [K pop]']));
        FreqGenres.Kpop += d.FreqKPop;
        d.FreqLatin = Number(FreqToNum(d['Frequency [Latin]']));
        FreqGenres.Latin += d.FreqLatin;
        d.FreqLofi = Number(FreqToNum(d['Frequency [Lofi]']));
        FreqGenres.Lofi += d.FreqLofi;
        d.FreqMetal = Number(FreqToNum(d['Frequency [Metal]']));
        FreqGenres.Metal += d.FreqMetal;
        d.FreqPop = Number(FreqToNum(d['Frequency [Pop]']));
        FreqGenres.Pop += d.FreqPop;
        d.FreqRnB = Number(FreqToNum(d['Frequency [R&B]']));
        FreqGenres["R&B"] += d.FreqRnB;
        d.FreqRap = Number(FreqToNum(d['Frequency [Rap]']));
        FreqGenres.Rap += d.FreqRap;
        d.FreqRock = Number(FreqToNum(d['Frequency [Rock]']));
        FreqGenres.Rock += d.FreqRock;
        d.FreqVideoGame = Number(FreqToNum(d['Frequency [Video game music]']));
        FreqGenres.VideoGame += d.FreqVideoGame;
        d.Anxiety = Number(d.Anxiety);
        d.Depression = Number(d.Depression);
        d.Insomnia = Number(d.Insomnia);
        d.OCD = Number(d.OCD);
    });

    let filteredData = rawData.filter(row => 
        Object.values(row).every(value => value !== null && value !== undefined && value !== '')
    );

    let entries = Object.entries(FreqGenres);
    let sorted = entries.sort((a, b) => b[1] - a[1]);
    let top6 = sorted.slice(0, 6);
    let genres = top6.map(d => d[0])
    console.log("Top 6 Genres");
    console.log(genres);

    let attributes = ["Anxiety", "Depression", "Insomnia", "OCD"];

    let tempStats = {};

    let MHbyAge = {
        Anxiety: {
            Child: 0, Adult: 0,
        },
        Depression: {
            Child: 0, Adult: 0,
        },
        Insomnia: {
            Child: 0, Adult: 0,
        },
        OCD: {
            Child: 0, Adult: 0,
        },
    };

    filteredData.forEach(d => {
        attributes.forEach(attr => {
            genres.forEach((genre, i) => {
                if (d.FavGenre === genre){
                    let key = `${attr}_${genre}`;
                    if (!tempStats[key]) {
                        tempStats[key] = { sum: 0, count: 0};
                    }
                    tempStats[key].sum += d[attr];
                    tempStats[key].count += 1;
                }
            });
        });
        

        if (d.Adult === "Child"){
            MHbyAge.Anxiety.Child += d.Anxiety;
            MHbyAge.Depression.Child += d.Depression;
            MHbyAge.Insomnia.Child += d.Insomnia;
            MHbyAge.OCD.Child += d.OCD;
        }
        if (d.Adult === "Adult"){
            MHbyAge.Anxiety.Adult += d.Anxiety;
            MHbyAge.Depression.Adult += d.Depression;
            MHbyAge.Insomnia.Adult += d.Insomnia;
            MHbyAge.OCD.Adult += d.OCD;
        }
    });

    let heatmapData = {};
    let id = 1;
    attributes.forEach(attr => {
        genres.forEach(genre => {
            let key = `${attr}_${genre}`;
            let stat = tempStats[key] || { sum: 0, count: 0 };
            let avg = stat.count > 0 ? stat.sum / stat.count : 0;
            heatmapData[id++] = {
                attribute: attr,
                genre: genre,
                avg: Math.round(avg)
            };
        });
    });

    console.log(heatmapData);


    console.log("Mental Health by Genre");

    console.log(heatmapData);

    
    console.log("Mental Health by Age");
    console.log(MHbyAge);

    let processedData = filteredData.map(d=>{



        return {
            "Service":d.Service,
            "Adult":d.Adult,

            /* "FavGenre":d.FavGenre, */
            "Exploratory":d.Exploratory,
            "ForeignLang":d.ForeignLang,
            "Value":1,
        };
    });
    console.log("processedData", processedData);

    let transformedMHbyAge = [];

    for (let condition in MHbyAge) {
    transformedMHbyAge.push({ group: condition, subgroup: "Child", value: MHbyAge[condition].Child });
    transformedMHbyAge.push({ group: condition, subgroup: "Adult", value: MHbyAge[condition].Adult });
    }

    console.log(transformedMHbyAge);




    let svg = d3.select("svg");

    // heatmap
    let g2 = svg.append("g")
        .attr("transform", `translate(${heatmapLeft + heatmapMargin.left}, ${heatmapTop + heatmapMargin.top})`);

    let xHeat = d3.scaleBand()
        .range([0, heatmapWidth])
        .domain(attributes)
        .padding(0.01);
    g2.append("g")
        .attr("transform", `translate(0, ${heatmapHeight})`)
        .call(d3.axisBottom(xHeat))

    let yHeat = d3.scaleBand()
        .range([heatmapHeight, 0])
        .domain(genres)
        .padding(0.01)
    g2.append("g")
        .call(d3.axisLeft(yHeat))

    var heatColor = d3.scaleLinear()
        .range(["white", "#69b3a2"])
        .domain([1,10])
    
    g2.selectAll()
        .data(Object.values(heatmapData))
        .enter()
        .append("rect")
            .attr("x", d => xHeat(d.attribute))
            .attr("y", d => yHeat(d.genre))
            .attr("width", xHeat.bandwidth())
            .attr("height", yHeat.bandwidth())
            .style("fill", d => heatColor(d.avg));


    // box plot
    let g1 = svg.append("g")
    .attr("transform", `translate(${boxMargin.left}, ${boxMargin.top})`);

    let groups = ["Anxiety", "Depression", "Insomnia", "OCD"];
    let subgroups = ["Child", "Adult"];

    // x axis
    let x = d3.scaleBand()
    .domain(groups)
    .range([0, boxWidth])
    .padding([0.2]);

    g1.append("g")
    .attr("transform", "translate(0," + boxHeight + ")")
    .call(d3.axisBottom(x).tickSize(0));

    // y axis
    let y = d3.scaleLinear()
    .domain([0, d3.max(transformedMHbyAge, d => d.value)])
    .range([boxHeight, 0]);

    g1.append("g")
    .call(d3.axisLeft(y));

    // subgroup scale
    let xSubgroup = d3.scaleBand()
    .domain(subgroups)
    .range([0, x.bandwidth()])
    .padding([0.05]);

    // color scale
    let color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#377eb8','#4daf4a']);

    // grouped bars
    g1.append("g")
    .selectAll("g")
    .data(groups)
    .enter()
    .append("g")
        .attr("transform", d => `translate(${x(d)}, 0)`)
    .selectAll("rect")
    .data(d => subgroups.map(key => {
        let entry = transformedMHbyAge.find(e => e.group === d && e.subgroup === key);
        return { key, value: entry.value };
    }))
    .enter().append("rect")
        .attr("x", d => xSubgroup(d.key))
        .attr("y", d => y(d.value))
        .attr("width", xSubgroup.bandwidth())
        .attr("height", d => boxHeight - y(d.value))
        .attr("fill", d => color(d.key));

    let graph = (() => {
        let keys = ["Service", "Adult", "ForeignLang", "Exploratory"];
        let index = -1;
        let nodes = [];
        let nodeByKey = new d3.InternMap([], JSON.stringify);
        let indexByKey = new d3.InternMap([], JSON.stringify);
        let links = [];
        
        for (let k of keys) {
            for (let d of processedData) {
            let key = [k, d[k]];
            if (nodeByKey.has(key)) continue;
            let node = { name: d[k] };
            nodes.push(node);
            nodeByKey.set(key, node);
            indexByKey.set(key, ++index);
            }
        }
        
        for (let i = 1; i < keys.length; ++i) {
            let a = keys[i - 1];
            let b = keys[i];
            let prefix = keys.slice(0, i + 1);
            let linkByKey = new d3.InternMap([], JSON.stringify);
        
            for (let d of processedData) {
            let names = prefix.map(k => d[k]);
            let value = 1; // default weight
            let link = linkByKey.get(names);
            if (link) {
                link.value += value;
                continue;
            }
            link = {
                source: indexByKey.get([a, d[a]]),
                target: indexByKey.get([b, d[b]]),
                names,
                value
            };
            links.push(link);
            linkByKey.set(names, link);
            }
        }
        
        return { nodes, links };
    })();

    chart = (() => {
        let sankey = d3.sankey()
          .nodeSort(null)
          .linkSort(null)
          .nodeWidth(4)
          .nodePadding(10)
          .extent([[stringMargin.left, stringMargin.top], [stringWidth, stringHeight]]);
      
        let color = d3.scaleOrdinal()
        .domain(["Spotify", "YouTube Music", "Apple Music", "Pandora", "Other"])
        .range(["#1DB954B3", "#FF0000B3", "#ff57b9B3", "#005483B3", "#888888B3"]); // custom colors
      
      
        const g3 = svg.append("g")
            .attr("transform", `translate(${stringMargin.left}, ${stringTop})`);
      
        let { nodes, links } = sankey({
          nodes: graph.nodes.map(d => Object.create(d)),
          links: graph.links.map(d => Object.create(d))
        });
      
        g3.append("g")
          .selectAll("rect")
          .data(nodes)
          .join("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("fill", "black")
          .append("title")
            .text(d => `${d.name}\n${d.value}`);
      
        g3.append("g")
            .attr("fill", "none")
          .selectAll("path")
          .data(links)
          .join("path")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke", d => color(d.names[0]))
            
            .attr("stroke-width", d => d.width)
            .style("mix-blend-mode", "multiply")
          .append("title")
            .text(d => `${d.names.join(" → ")}\n${d.value}`);
      
        g3.append("g")
            .style("font", "12px sans-serif")
          .selectAll("text")
          .data(nodes)
          .join("text")
            .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
            .style("font-weight", "bold") // Bold text
            .style("fill", "black") // Main text color
            .style("stroke", "white") // Outline color
            .style("stroke-width", "2px") // Outline thickness
            .style("paint-order", "stroke") // Draw outline first
            .text(d => d.name)
          .append("tspan")
            .attr("fill-opacity", 0.7)
            .text(d => ` ${d.value}`);
      
        return g3.node();
    })();
      
        





});

