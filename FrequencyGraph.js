import React, { Component } from 'react'
import * as d3 from 'd3'
import { selectAll } from 'd3'

class FrequencyGraph extends Component
{
    constructor(props)
    {
        super(props)

        this.createGraph = this.createGraph.bind(this)
    }

    componentDidMount()
    {
        this.createGraph()
    }

    componentDidUpdate()
    {
        this.createGraph()
    }

    createGraph()
    {
        const sinceDate = this.props.sinceDate
        const node = this.node
        fetch(`/frenquency_graph/${ sinceDate }`)
            .then(response => response.json())
            .then(data =>
                {
                    let allSent = data.allSent
                    let allReceived = data.allReceived
                    let result = allReceived.reduce((result, d) => 
                    {
                        let currentSender = result[d.Sender] || {
                            "Sender": d.Sender || "N/A",
                            "Count": 0
                        }
                        currentSender.Count += 1
                        result[d.Sender] = currentSender
                        return result
                    }, {})

                    result = Object.keys(result).map(key => result[key])

                    result = result.sort((a, b) =>
                    {
                        return d3.descending(a.Count, b.Count)
                    })

                    result = result.filter(function(d,i){ return i < 20 })

                    console.log(result)

                    let width = 600
                    let height = 600
                    let margin = 
                        {
                            top: 20,
                            bottom: 20,
                            left: 20,
                            right: 20
                        }
                    let bodyHeight = height - margin.top - margin.bottom
                    let bodyWidth = width - margin.left - margin.right
                    
                    let container = d3.select(node)

                    container
                        .attr("width", width)
                        .attr("height", height)
                    
                    let maximumCount = d3.max(result, d => d.Count)
                    let top10Senders = d3.map(result, d => d.Sender)

                    let xScale = d3
                        .scaleBand()
                        .range([0, bodyWidth])
                        .domain(top10Senders)
                        .padding(0.2)
                    
                    let yScale = d3
                        .scaleLinear()
                        .range([0, bodyHeight])
                        .domain([0, maximumCount])

                    let xAxis = d3
                        .axisBottom(xScale)
                        .tickValues([])

                    container
                        .append("g")
                        .style("transform", `translate(${margin.left}px, ${height - margin.bottom}px)`)
                        .call(xAxis)

                    let yAxis = d3
                        .axisLeft(yScale)
                        .ticks(0)

                    container
                        .append("g")
                        .style("transform", `translate(${margin.left}px, ${margin.top}px)`)
                        .call(yAxis) 

                    let body = container
                        .append("g")
                        .style("transform", `translate(${margin.left}px, ${margin.top}px)`)

                    let bars = body
                        .selectAll(".bar")
                        .data(result)

                    let oldRect = selectAll("rect").remove()

                    bars
                        .enter()
                        .append("rect")
                        .attr("height", d => yScale(d.Count))
                        .attr("width", d => xScale.bandwidth())
                        .attr("x", d => xScale(d.Sender))
                        .attr("y", d => bodyHeight - yScale(d.Count))
                        .attr("fill", "#15559a")
                        .on("mouseenter", function(event, d)
                            {
                                d3
                                    .select(this)
                                    .attr("fill", "#66a9c9")

                                d3
                                    .select("#tooltip")
                                    .style("display", "block")
                                    .style("opacity", 0.9)
                                    .html("Sender: " + d.Sender + "<br/> Count: " + d.Count)
                                    .style("top", (event.clientY - 30) + "px")
                                    .style("left", (event.clientX + 30) + "px")
                            })
                        .on("mouseleave", function(event, d) 
                            {
                                d3
                                    .select(this)
                                    .attr("fill", "#15559a")
                                
                                d3
                                    .select("#tooltip")
                                    .style("display", "none")
                            })
                    
                    bars.exit().remove()
                })
    }

    

    render()
    {
        return(
            <>
                <svg ref={node => this.node = node} />
                <div id="tooltip" />
            </>
        )
    }
}

export default FrequencyGraph