function init() {
    let selector = d3.select("#selDataset");
    d3.json("samples.json").then(data => {
        var sampleNames = data.names;
        sampleNames.forEach(sampleName => {
            selector.append("option")
            .text(sampleName)
            .property("value", sampleName);
        });
    });
    onPageLoad();
}

function onPageLoad() {
    optionChanged("940");
}

function optionChanged(selectedValue){
    buildMetadata(selectedValue);
    buildVisualization(selectedValue);
}

function  buildMetadata(selectedValue) {
    d3.json("samples.json").then(data => {
        let metadatas = data.metadata;
        let filteredMetadata = metadatas.filter(metadata => metadata.id == selectedValue)[0];
        console.log(filteredMetadata);
        let panel = d3.select("#sample-metadata");
        
        panel.html("");
        Object.entries(filteredMetadata).forEach(entry => {
            panel.append("h6").text(entry[0] + " : "+ entry[1]);
        });
        
    });
}

function buildVisualization(selectedValue) {
    d3.json("samples.json").then(data => {
        let samples = data.samples;
        let filteredSample = samples.filter(sample => sample.id == selectedValue)[0];
        let sample_datas = [];
        filteredSample.otu_ids.forEach((value, index) => {
            let sample_data = {};
            sample_data.otu_id = value;
            sample_data.sample_value = filteredSample.sample_values[index];
            sample_data.otu_label = filteredSample.otu_labels[index];
            sample_datas.push(sample_data);
        });
        this.buildBarChart(sample_datas);
        this.buildBubbleChart(sample_datas);
    }, this);
}

function buildBarChart(sample_datas) {
    var orderedSample = sample_datas.slice(0,10).sort((a,b) => a.sample_value < b.sample_value);
    orderedSample = orderedSample.reverse();
    var trace1 = {
        x: orderedSample.map(row => row.sample_value),
        y: orderedSample.map(row => 'OTU ' + row.otu_id),
        text: orderedSample.map(row => row.otu_label),
        type: "bar",
        orientation: "h"
    };

    // data
    var data = [trace1];

    // Apply the group bar mode to the layout
    var layout = {
        margin: {
            l: 100,
            r: 100,
            t: 100,
            b: 100
        }
    };

    // Render the plot to the div tag with id "bar"
    Plotly.newPlot("bar", data, layout);
}

function buildBubbleChart(sample_datas) {
    var trace1 = {
        x: sample_datas.map(row => row.otu_id),
        y: sample_datas.map(row => row.sample_value),
        text: sample_datas.map(row => row.otu_label),
        mode: "markers",
        marker: {
            size: sample_datas.map(row => row.sample_value),
            color: sample_datas.map(row => row.otu_id),
            colorscale: "Earth"
        },
        type: "scatter",
    };

    // data
    var data = [trace1];

    // Apply the group bar mode to the layout
    var layout = {
        xaxis: {
            title: "OTU ID"
        },
        showlegend: false,
        height: 600,
        width: 600

    };

    // Render the plot to the div tag with id "bar"
    Plotly.newPlot("bubble", data, layout);
}

init();