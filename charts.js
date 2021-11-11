function init() {
  // Grab a reference to the dropdown select element
  let selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    let sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    let firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    let metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    let resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    let result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    let PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

function buildCharts(sample) {

  d3.json("samples.json").then((data) => {

    let samples = data.samples;
    let resultArray = samples.filter(sampleObj => sampleObj.id == sample);
    let result = resultArray[0];
    let { otu_ids, otu_labels, sample_values } = result;

    // TOP 10 FINAL DATA
    let finalData = otu_ids.map((el, i) => {
      return {
        otu_ids: el,
        otu_labels: otu_labels[i],
        sample_values: sample_values[i],
      }
    })

    finalData = finalData.sort((a, b) => b.sample_values < a. sample_values).slice(0, 10).reverse()

    // BAR CHART
    let barLayout = {
      x: finalData.map(e => e.sample_values),
      y: finalData.map(e => `OTU ${e.otu_ids}`),
      text: finalData.map(e => e.otu_labels),
      type: 'bar',
      orientation: 'h',
    };

    let barData = [barLayout];

    let layout = {
      title: "Top 10 Bacteria Cultures Found",
    };
    Plotly.newPlot("bar", barData, layout);

    // BUBBLE CHART
    let trace1 = {
      x: otu_ids,
      y: sample_values,
      text: otu_labels,
      mode: 'markers',
      marker: {
        size: sample_values,
        color: otu_ids,
      },
    };
    
    let bubbleData = [trace1];
    
    let bubbleLayout = {
      title: 'Bacteria Cultures per Sample',
      xaxis: { title: "OTU ID" },
      showlegend: false,
    };
    
    Plotly.newPlot('bubble', bubbleData, bubbleLayout);

    // GAUGGE CHART
    let metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    let metadataResultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    let metadataResult = metadataResultArray[0];

    var gdata = [
      {
        domain: { x: [0, 1], y: [0, 1] },
        value: metadataResult.wfreq,
        title: { text: "Belly Button Washing Frequency (Scrubs per Week)" },
        type: "indicator",
        mode: "gauge+number",
        gauge: {
          axis: { range: [null, 10], },
          bar: { color: 'black', },
          steps: [
            { range: [0, 2], color: "red" },
            { range: [2, 4], color: "orange" },
            { range: [4, 6], color: "yellow" },
            { range: [6, 8], color: "green" },
            { range: [8, 10], color: "blue" },
          ],
        }
      }
    ];
    
    var glayout = { width: 600, height: 450, margin: { t: 0, b: 0 } };
    Plotly.newPlot('gauge', gdata, glayout);

  });
}
