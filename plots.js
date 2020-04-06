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

function getWeeklyWashFrequenceRange(metadatas) {
    let wfreqs = [];
    metadatas.forEach(function(metadata) {
        wfreqs.push(metadata.wfreq);
    });
    wfreqs = wfreqs.filter(a => a != null).sort((a,b) => (a - b));
    return wfreqs;
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
        let metadatas = data.metadata;
        let filteredMetadata = metadatas.filter(metadata => metadata.id == selectedValue)[0];
        buildBarChart(sample_datas);
        buildBubbleChart(sample_datas);
        buildGaugeChart(metadatas, filteredMetadata.wfreq, sample_datas);
    });
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
        title: 'Top 10 Bacteria specimen',
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

function buildGaugeChart(metadatas, selected_wfreq, selected_sample_datas) {
    let wfreqs = getWeeklyWashFrequenceRange(metadatas);
    console.log(wfreqs);
    let max_wfreq = wfreqs[wfreqs.length - 1];
    var data = [
        {
          domain: { x: [0, 1], y: [0, 1] },
          title: { text: "Belly Button Washing Frequency <br> Scrubs per Week" },
          value: selected_wfreq,
          type: "indicator",
          mode: "gauge+number",
          gauge: {
            axis: { range: [null, max_wfreq], ticks: '',
                    tickmode: 'array',
                    tickvals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                    ticktext: ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9'],
                    ticktextposition: 'middle center'
                },
            bar: {color: 'blue', thickness: 0.1},
            steps: [
                {range: [0, 1], color : 'rgba(218, 237, 192, 1)'},
                {range: [1, 2], color : 'rgba(194, 220, 169, 1)'},
                {range: [2, 3], color : 'rgba(170, 204, 146, 1)'},
                {range: [3, 4], color : 'rgba(146, 187, 124, 1)'},
                {range: [4, 5], color : 'rgba(123, 171, 101, 1)'},
                {range: [5, 6], color : 'rgba(99, 155, 78, 1)'},
                {range: [6, 7], color : 'rgba(75, 138, 56, 1)'},
                {range: [7, 8], color : 'rgba(51, 122, 33, 1)'},
                {range: [8, 9], color : 'rgba(28, 106, 11, 1)'}
            ]
          },
        }
      ];
      
      var layout = { 
                    width: 600, 
                    height: 450, 
                    margin: { t: 0, b: 0 } 
                    };
      Plotly.newPlot('gauge', data, layout);
}
init();