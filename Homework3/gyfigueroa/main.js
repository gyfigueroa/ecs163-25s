let abFilter = 25;
let width = window.innerWidth;
let height = window.innerHeight;

let svgG2 = d3.select("svg.g2");

function FreqToNum(freq){
    if (freq === "Never"){ return 0; } 
    else if (freq === "Rarely"){ return 1 }
    else if (freq === "Sometimes"){ return 2 }
    else { return 3 };
}



d3.csv("data/mxmh_survey_results.csv").then(rawData =>{
    console.log("rawData", rawData);

    let filteredData = rawData.filter(row => 
        Object.values(row).every(value => value !== null && value !== undefined && value !== '')
    );

    let attributes = ["Anxiety", "Depression", "Insomnia", "OCD"];
    let ageGroup = ["Child", "Adult"];
    let FreqGenres = {Classical: 0, Country: 0, EDM: 0, Folk: 0, Gospel: 0, "Hip hop": 0, Jazz: 0, Kpop: 0, Latin: 0, Lofi: 0, Metal: 0, Pop: 0, "R&B": 0, Rap: 0, Rock: 0, VideoGame: 0};
    let services = ["Spotify", "YouTube Music", "Apple Music", "Pandora"];
    

    let tempStats = {};
    let genres;

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
    let heatmapData = {};
    let processedData;
    let transformedMHbyAge = [];

    function computeData(filteredData){
        FreqGenres = {Classical: 0, Country: 0, EDM: 0, Folk: 0, Gospel: 0, "Hip hop": 0, Jazz: 0, Kpop: 0, Latin: 0, Lofi: 0, Metal: 0, Pop: 0, "R&B": 0, Rap: 0, Rock: 0, VideoGame: 0};

        filteredData.forEach(function(d){
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
                d.ForeignLang = "Bilingual";
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

        

        let entries = Object.entries(FreqGenres);
        let sorted = entries.sort((a, b) => b[1] - a[1]);
        let top6 = sorted.slice(0, 6);
        genres = top6.map(d => d[0])
        console.log("Top 6 Genres");
        console.log(genres);
        
        tempStats = {};
        heatmapData = {};
        MHbyAge = {
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

        console.log("Mental Health by Genre");
        console.log(heatmapData);

        
        console.log("Mental Health by Age");
        console.log(MHbyAge);

        processedData = filteredData.map(d=>{
            return {
                "Service":d.Service,
                "Adult":d.Adult,
                "Exploratory":d.Exploratory,
                "ForeignLang":d.ForeignLang,
                "Value":1,
            };
        });
        console.log("processedData", processedData);

        // reformat data becausee i formatted it weird the first time
        transformedMHbyAge = [];

        for (let condition in MHbyAge) {
        transformedMHbyAge.push({ group: condition, subgroup: "Child", value: MHbyAge[condition].Child });
        transformedMHbyAge.push({ group: condition, subgroup: "Adult", value: MHbyAge[condition].Adult });
        }

        console.log(transformedMHbyAge);
    }

    computeData(filteredData);
    //
    
    //

    



    let svg = d3.select("svg");

    function drawHeatmap() {
        console.log("Drawing Heat Map...")
        svgG2.selectAll("*").remove(); // clear previous drawing
    
        let g2Node = svgG2.node();
        let width = g2Node.clientWidth;
        let height = g2Node.clientHeight;
    
        let margin = { top: 50, right: 30, bottom: 60, left: 60 };
        let innerWidth = width - margin.left - margin.right;
        let innerHeight = height - margin.top - margin.bottom;

        svgG2
            .attr("width", width)
            .attr("height", height)
            .append("text")
            .attr("class", "chart-title")
            .attr("x", width / 2)
            .attr("y", margin.top / 2)
            .text("Average Mental Health Scores by Genre");
    
        let g2 = svgG2
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);
    
        // heatmap logic
        // x axis
        let xHeat = d3.scaleBand()
            .range([0, innerWidth])
            .domain(attributes)
            .padding(0.01);
        g2.append("g")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(xHeat))

        // y axis
        let yHeat = d3.scaleBand()
            .range([innerHeight, 0])
            .domain(genres)
            .padding(0.01)
        g2.append("g")
            .call(d3.axisLeft(yHeat))

        var heatColor = d3.scaleLinear()
            .range(["#68e864", "#e86464"])
            .domain([1,7])
        
        const rects = g2.selectAll("rect")
        .data(Object.values(heatmapData), d => `${d.attribute}_${d.genre}`);

        // ENTER: create new rects
        rects.enter()
        .append("rect")
            .attr("x", d => xHeat(d.attribute))
            .attr("y", d => yHeat(d.genre))
            .attr("width", xHeat.bandwidth())
            .attr("height", yHeat.bandwidth())
            .style("fill", d => heatColor(d.avg))
        .merge(rects) // UPDATE: merge new + existing
            .transition()
            .duration(800)
            .style("fill", d => heatColor(d.avg));

        // EXIT: remove unused rects
        rects.exit()
        .transition()
            .duration(400)
            .style("opacity", 0)
            .remove();
        
        // legend stuff
        let legendWidth = 100;
        let legendHeight = 10;
        
        let legendScale = d3.scaleLinear()
            .domain([1, 7])
            .range([0, legendWidth]);
        
        let legendAxis = d3.axisBottom(legendScale)
            .ticks(5)
            .tickFormat(d3.format(".0f"));
        
        let legend = g2.append("g")
            .attr("transform", `translate(${(innerWidth - legendWidth)/2}, ${innerHeight + 20})`);
        
        let gradient = svgG2.append("defs")
            .append("linearGradient")
            .attr("id", "legendGradient");
        
        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#68e864");
        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#e86464");
        
        legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#legendGradient)");
        
        legend.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(legendAxis);
                
    }
    
    drawHeatmap();
    
    window.addEventListener("resize", drawHeatmap);
    


    let svgG1 = d3.select("svg.g1");

    function drawBoxPlot(){
        console.log("Drawing Box Plot...")

        svgG1.selectAll("*").remove(); // clear previous drawing

        
        let g1Node = svgG1.node();
        let g1Width = g1Node.clientWidth;
        let g1Height = g1Node.clientHeight;

        let boxMargin = { top: 50, right: 30, bottom: 60, left: 60 };
        let boxWidth = g1Width - boxMargin.left - boxMargin.right;
        let boxHeight = g1Height - boxMargin.top - boxMargin.bottom - 20;

        svgG1
        .attr("width", g1Width)
        .attr("height", g1Height)
        .append("text")
        .attr("x", g1Width / 2)
        .attr("y", boxMargin.top / 2)
        .attr("class", "chart-title")
        .text("Mental Health by Age Group");

        let g1 = svgG1
        .attr("width", g1Width)
        .attr("height", g1Height)
        .append("g")
        .attr("transform", `translate(${boxMargin.left}, ${boxMargin.top})`);

        // axis titles
        g1.append("text")
        .attr("class", "axis-title")
        .attr("x", boxWidth / 2)
        .attr("y", boxHeight + 40)
        .text("Mental Health Attribute");

        g1.append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("x", -boxHeight / 2)
        .attr("y", -45)
        .text("Score Total");

        // x axis
        let x = d3.scaleBand()
        .domain(attributes)
        .range([0, boxWidth])
        .padding([0.2]);

        g1.append("g")
        .attr("transform", "translate(0," + boxHeight + ")")
        .call(d3.axisBottom(x));

        

        // y axis
        let y = d3.scaleLinear()
        .domain([0, 2000])
        .range([boxHeight, 0]);

        g1.append("g")
        .call(d3.axisLeft(y));

        // subgroup scale
        let xSubgroup = d3.scaleBand()
        .domain(ageGroup)
        .range([0, x.bandwidth()])
        .padding([0.05]);

        // color scale
        let color = d3.scaleOrdinal()
        .domain(ageGroup)
        .range(['#377eb8','#4daf4a']);

        // grouped bars
        /* g1.append("g")
            .selectAll("g")
            .data(attributes)
            .enter()
            .append("g")
            .attr("transform", d => `translate(${x(d)}, 0)`)
            .selectAll("rect")
            .data(d => ageGroup.map(key => {
                let entry = transformedMHbyAge.find(e => e.group === d && e.subgroup === key);
                return { key, value: entry.value };
            }))
            .enter().append("rect")
                .attr("x", d => xSubgroup(d.key))
                .attr("y", d => y(d.value))
                .attr("width", xSubgroup.bandwidth())
                .attr("height", d => boxHeight - y(d.value))
                .attr("fill", d => color(d.key)); */

        const bars = g1.selectAll("g.barGroup")
            .data(attributes)
            .join("g")
                .attr("class", "barGroup")
                .attr("transform", d => `translate(${x(d)}, 0)`);

        const rects = bars.selectAll("rect")
            .data(d => ageGroup.map(key => {
                let entry = transformedMHbyAge.find(e => e.group === d && e.subgroup === key);
                return { key, value: entry.value };
            }), d => d.key);

        // JOIN: enter new bars
        rects.enter()
            .append("rect")
                .attr("x", d => xSubgroup(d.key))
                .attr("width", xSubgroup.bandwidth())
                .attr("fill", d => color(d.key))
                .attr("y", y(0))
                .attr("height", 0)
            .transition()
                .duration(800)
                .attr("y", d => y(d.value))
                .attr("height", d => boxHeight - y(d.value));

        // UPDATE: animate existing bars
        rects.transition()
            .duration(800)
            .attr("y", d => y(d.value))
            .attr("height", d => boxHeight - y(d.value));

        // EXIT: remove old bars
        rects.exit()
            .transition()
                .duration(400)
                .attr("y", y(0))
                .attr("height", 0)
                .remove();


        let legend = svgG1.append("g")
            .attr("transform", `translate(${g1Width - 70}, ${boxMargin.top})`);
        
        ageGroup.forEach((key, i) => {
            let yOffset = i * 20;
            legend.append("rect")
              .attr("x", 0)
              .attr("y", yOffset)
              .attr("width", 10)
              .attr("height", 10)
              .attr("fill", color(key));
            legend.append("text")
              .attr("class", "legend-label")
              .attr("x", 15)
              .attr("y", yOffset + 9)
              .style("font-size", "12px")
              .text(key);
          });
        
    }

    drawBoxPlot();
    
    window.addEventListener("resize", drawBoxPlot);
    
    // create links for parallel set
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

    function updateGraphs(newData){
        console.log("updating graphs...");
        computeData(newData);
        console.log('| attempting to draw box plot ');
        drawBoxPlot();
        console.log('| attempting to draw heat map ');
        drawHeatmap();
        console.log('graphs updated');
    }

    let svgG3 = d3.select("svg.g3");
    let g3Node = svgG3.node();
    let g3Width = g3Node.clientWidth;
    let g3Height = g3Node.clientHeight;
    
    let stringMargin = { top: 50, right: 30, bottom: 60, left: 20 };
    let stringWidth = g3Width - stringMargin.left - stringMargin.right;
    let stringHeight = g3Height - stringMargin.top - stringMargin.bottom;

    

    let nodes = [], links = [];

    function drawParallelSet(){
        svgG3 = d3.select("svg.g3");
        g3Node = svgG3.node();
        g3Width = g3Node.clientWidth;
        g3Height = g3Node.clientHeight;
        
        stringMargin = { top: 50, right: 30, bottom: 60, left: 20 };
        stringWidth = g3Width - stringMargin.left - stringMargin.right;
        stringHeight = g3Height - stringMargin.top - stringMargin.bottom;


        let color = d3.scaleOrdinal()
        .domain(["Spotify", "YouTube Music", "Apple Music", "Pandora", "Other"])
        .range(["#1DB954B3", "#FF0000B3", "#ff57b9B3", "#005483B3", "#888888B3"]); // custom colors
      
        svgG3.selectAll("*").remove();
        
        

        svgG3
            .attr("width", g3Width)
            .attr("height", g3Height)
            .append("text")
            .attr("class", "chart-title")
            .attr("x", g3Width / 2)
            .attr("y", stringMargin.top / 2 + 15)
            .text("Demographic Flow (Music and Mental Health Survey)");


        let sankey = d3.sankey()
          .nodeSort(null)
          .linkSort(null)
          .nodeWidth(4)
          .nodePadding(10)
          .extent([[stringMargin.left, stringMargin.top], [stringWidth, stringHeight]]);
      
        
    
        
      
        ({ nodes, links } = sankey({
          nodes: graph.nodes.map(d => Object.create(d)),
          links: graph.links.map(d => Object.create(d))
        }));



        let minX = d3.min(nodes, d => d.x0);
        let maxX = d3.max(nodes, d => d.x1);
        let minY = d3.min(nodes, d => d.y0);
        let maxY = d3.max(nodes, d => d.y1);

        let nodeCenterX = (minX + maxX) / 2;
        let nodeCenterY = (minY + maxY) / 2;

        let svgCenterX = g3Width / 2;
        let svgCenterY = g3Height / 2;

        let translateX = svgCenterX - nodeCenterX;
        let translateY = svgCenterY - nodeCenterY;

        svgG3
            .attr("width", g3Width)
            .attr("height", g3Height);
        
        let zoomGroup = svgG3
            .append("g")
            .attr("class", "zoom-container")
            .attr("transform", `translate(${translateX}, ${translateY})`);


        console.log(translateX, translateY);
        let g3 = zoomGroup
            .append("g")
            .attr("class", "zoom-content")
/*             .attr("transform", `translate(${translateX}, ${translateY})`); */


        let selectedNode = null;
      
        g3.append("g")
          .selectAll("rect")
          .data(nodes)
          .join("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            //.attr("fill", "black")
            .on("click", (event, d) => {
                if (selectedNode === d.name) {
                    selectedNode = null;
                    g3.selectAll("rect").attr("fill", "black");
                    g3.selectAll("path").attr("stroke-opacity", 1);
                    updateGraphs(filteredData); // reset to full dataset
                } else {
                    selectedNode = d.name;
                    let filtered = filteredData.filter(row =>
                    row.Service === d.name ||
                    row.Adult === d.name ||
                    row.Exploratory === d.name ||
                    row.ForeignLang === d.name
                    );
                    g3.selectAll("rect")
                    .attr("fill", node => node.name === d.name ? "orange" : "lightgray");
                    g3.selectAll("path")
                    .attr("stroke-opacity", link =>
                        link.names.includes(d.name) ? 1.0 : 0.1
                    );
                    updateGraphs(filtered);
                }
            })
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
            .attr("x", d => d.x0 < g3Width / 2 ? d.x1 + 6 : d.x0 - 6)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("class", "axis-label")
            .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
            .attr("font-weight", "600")
            .style("stroke", "white") // Outline color
            .style("stroke-width", "2px") // Outline thickness
            .style("paint-order", "stroke") // Draw outline first
            .text(d => d.name)
          .append("tspan")
            .attr("fill-opacity", 0.7)
            .text(d => ` ${d.value}`);

        const resetButton = document.getElementById("resetZoomButton");
        const helpText = document.getElementById("helpText");

        const zoom = d3.zoom()
            .scaleExtent([1, 5]) // Zoom levels: from 1x to 5x
            .translateExtent([[0, 0], [g3Width, g3Height]]) // Optional bounds
            .on("zoom", (event) => {
                zoomGroup.select(".zoom-content")
                    .attr("transform", event.transform)

                    // Show the reset button when zoom is not identity
                if (!event.transform.k || event.transform.k === 1) {
                    resetButton.classList.remove("visible");
                    helpText.classList.remove("hidden");
                } else {
                    resetButton.classList.add("visible");
                    helpText.classList.add("hidden");
                }
            });

        svgG3.call(zoom);

        // Reset zoom on button click
        resetButton.addEventListener("click", () => {
            svgG3.transition()
                .duration(500)
                .call(zoom.transform, d3.zoomIdentity);

            resetButton.classList.remove("visible");
            helpText.classList.remove("hidden");
        });


      

    };

    drawParallelSet();

    window.addEventListener("resize", drawParallelSet);
      
        





});

