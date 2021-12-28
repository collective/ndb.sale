import React, { useReducer, useEffect, useState } from "react"
import { navigate } from "gatsby"
import { Tab, Tabs, TabList, TabPanel } from "react-tabs"
import Slider from "rc-slider"
import Select from "react-select"
import Modal from "react-modal"
import ReactECharts from "echarts-for-react"
import Header from "../components/common/header"
import { useQuery, useLazyQuery, useMutation } from "@apollo/client"
import { getSecTomorrow, numberWithCommas, numberWithLength, getTimeDiffOverall, getDiffOverall } from "../utilities/number"
import { ChartIcon, Qmark, CloseIcon } from "../utilities/imgImport"
import { useWindowSize } from "../utilities/customHook"
import { PLACE_BID } from "../apollo/graghqls/mutations/Bid"
import { GET_AUCTION_BY_STATUS, GET_AUCTION, GET_AUCTION_BY_NUMBER, GET_BIDLIST_BY_ROUND } from "../apollo/graghqls/querys/Auction"

// import { AuctionService } from "../apollo/model/AuctionService"
// import * as GraphQL from "../apollo/graghqls/querys/Auction"

const ndb_token = `Since the beginning of NDB’s project the vision is to provide clean green technologies to the world. The NDB token is not a security token nor does it represent any shares of NDB SA.

By using NDB token you will be able to contribute to the development of our technologies and our vision. We plan to expand our ecosystem to multiple areas including deep space exploration, sustainable fashion, quantum computing, and more. 
`
const statistics = [
    {
        rank: 1,
        placement: "TeslaFirst",
        bid: "1300",
    },
    {
        rank: 2,
        placement: "Volta Pancake",
        bid: "850",
    },
    {
        rank: 3,
        placement: "Meitner Cat",
        bid: "400",
    },
    {
        rank: 4,
        placement: "Curie Mobile",
        bid: "305",
    },
    {
        rank: 5,
        placement: "Tesla.12",
        bid: "100",
    },
    {
        rank: 99,
        placement: "You",
        bid: "5",
    },
]
const options = [
    { value: "bid_performance", label: "Bid performance" },
    { value: "round_performance", label: "Round performance" },
    { value: "ndb_token", label: "NDB Token Value" },
]

const Auction = () => {
    const size = useWindowSize()
   
    const [state, setState] = useReducer((old, action) => ({ ...old, ...action }), {
        tabIndex: 0,
        curTime: {
            hours: 0,
            minutes: 0,
            seconds: 0,
        },
        amount: 1,
        price: 1,
        total: "",
        place_bid: false,
        bidModal: false,
        show_chart: false,
        selectLabel: options[0],
        bidChartData: {
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow",
                },
            },
            color: "#23C865",
            grid: {
                left: "3%",
                right: "4%",
                bottom: "3%",
                containLabel: true,
            },
            xAxis: [
                {
                    type: "category",
                    data: [0, 100, 200, 300, 400, 500],
                    axisTick: {
                        alignWithLabel: true,
                    },
                },
            ],
            yAxis: [
                {
                    type: "value",
                },
            ],
            series: [
                {
                    name: "Bid",
                    type: "bar",
                    barWidth: "30%",
                    data: [330, 252, 200, 334, 390, 330, 220],
                },
            ],
        },
        round: "",
    })

    const {
        tabIndex,
        curTime,
        amount,
        price,
        place_bid,
        bidModal,
        show_chart,
        selectLabel,
        bidChartData,
        round,
    } = state

    const { data, loading, error } = useQuery(GET_AUCTION)

    const roundData = data?.getAuctions?.filter((item) =>{
        if (item.status === 2 || item.status === 0){
            return item
        }
    })  

    // get round based data
    const { data: roundM, loading: loadingM, error: errorM } = useQuery(GET_AUCTION_BY_NUMBER, {
        variables: { round: roundData? roundData[0].number : -1 },
    })

    const { data: roundH, loading: loadingH, error: errorH } = useQuery(GET_AUCTION_BY_NUMBER, {
        variables: { round: roundData? roundData[0]?.number + 1 : -1 },
    })

    const { data: roundL, loading: loadingL, error: errorL } = useQuery(GET_AUCTION_BY_NUMBER, {
        variables: { round: roundData? roundData[0]?.number - 1 : -1 },
    })

    // get history bids
    const { data: historyBidListM, loading: loadingHistoryBidListM, error: errorHistoryBidListM } = useQuery(GET_BIDLIST_BY_ROUND, {
        variables: { round: roundData? roundData[0].number : -1 },
    })

    const { data: historyBidListH, loading: loadingHistoryBidListH, error: errorHistoryBidListH } = useQuery(GET_BIDLIST_BY_ROUND, {
        variables: { round: roundData? roundData[0]?.number + 1 : -1  },
    })

    const { data: historyBidListL, loading: loadingHistoryBidListL, error: errorHistoryBidListL } = useQuery(GET_BIDLIST_BY_ROUND, {
        variables: { round: roundData? roundData[0]?.number - 1 : -1 },
    })

    const [selectedData, setSelectedData] = useState(0)

    const fnSelectedRoundData = () => {
        if(selectedData === 0){
            return roundL?.getAuctionByNumber
        }else if (selectedData === 1){
            return roundM?.getAuctionByNumber
        }else{
            return roundH?.getAuctionByNumber
        }
    }

    console.log(new Date(fnSelectedRoundData()?.startedAt))
    console.log(new Date(fnSelectedRoundData()?.endedAt))

    const distanceToDate =  getTimeDiffOverall(fnSelectedRoundData()?.startedAt, fnSelectedRoundData()?.endedAt)  // 86400
    const duration = getDiffOverall(fnSelectedRoundData()?.startedAt, fnSelectedRoundData()?.endedAt) //getSecTomorrow()
    const percentage = (distanceToDate / duration) * 100
   
    const [PlaceBid] = useMutation(PLACE_BID, {
        onCompleted: (data) => {
            console.log("received Mutation data", data)
            setState({ place_bid: true })
        },
        onError: (err) => {
            console.log("received Mutation data", err)
            setState({ place_bid: true })
        }
    })

    useEffect(() => setState(
        { 
            round: data?.getAuctions[selectedData] 
        }), []
    )

    console.log(selectedData)

    useEffect(() => {

        console.log( new Date(fnSelectedRoundData()?.endedAt));
        console.log(new Date(fnSelectedRoundData()?.startedAt));
        const id = setInterval(() => {
            setState({
                curTime: {
                    hours: parseInt(getTimeDiffOverall(fnSelectedRoundData()?.startedAt, fnSelectedRoundData()?.endedAt) / (60 * 60)),
                    minutes: parseInt((getTimeDiffOverall(fnSelectedRoundData()?.startedAt, fnSelectedRoundData()?.endedAt) % (60 * 60)) / 60),
                    seconds: parseInt(getTimeDiffOverall(fnSelectedRoundData()?.startedAt, fnSelectedRoundData()?.endedAt) % 60),
                },
            })
        }, 1000)
        return () => {
            clearInterval(id)
        }
    }, [])
    return (
        <main className="auction-page">
            <Header />
            <section className="section-auction container">
                <div className="current-round">
                    {/* <div>
                        <h4>Round {data?.getAuctions[selectedData]?.number}</h4>
                        <p>
                            Token Available <span>{data?.getAuctions[selectedData].token}</span>
                        </p>
                    </div> */}
                    <img
                        src={ChartIcon}
                        alt="chart"
                        className="show-chart"
                        onClick={() => setState({ show_chart: !show_chart })}
                        onKeyDown={() => setState({ show_chart: !show_chart })}
                        role="presentation"
                    />
                </div>
                <div className="row h-100">
                    <div
                        className={`auction-left col-lg-4 col-md-5 ${
                            show_chart ? "d-none" : "d-block"
                        }`}
                    >
                        <Tabs className="round-tab" forceRenderTabPanel defaultIndex={0} onSelect={(k) => setSelectedData(k)}>
                            
                                {
                                    data?.getAuctions?.map((item, idx) => 
                                    {
                                        if(item.status === 2 || item.status === 0 ) {
                                            return <TabList>
                                                <Tab>Round {item.number - 1}</Tab>
                                                <Tab>Round {item.number}</Tab>
                                                <Tab>Round {item.number + 1}</Tab> 
                                            </TabList>
                                        }   
                                    })
                                }
                            <TabPanel>
                                Token Available <span className="fw-bold">{roundL?.getAuctionByNumber?.totalToken}</span>
                            </TabPanel>
                            <TabPanel>
                                Token Available <span className="fw-bold">{roundM?.getAuctionByNumber?.totalToken}</span>
                            </TabPanel>
                            <TabPanel>
                                Token Available <span className="fw-bold">{roundH?.getAuctionByNumber?.totalToken}</span>
                            </TabPanel>
                        </Tabs>
                        <Tabs
                            className="statistics-tab"
                            selectedIndex={tabIndex}
                            onSelect={(index) => setState({ tabIndex: index })}
                        >
                            <TabList>
                                <Tab>Ndb token</Tab>
                                <Tab>StatiStics</Tab>
                                <Tab>Bids history</Tab>
                            </TabList>
                            <TabPanel>
                                <p className="text">{ndb_token}</p>
                            </TabPanel>
                            <TabPanel>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Placement</th>
                                            <th>Highest bid per token</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {statistics.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.rank + ". " + item.placement}</td>
                                                <td>
                                                    {item.bid}
                                                    <span className="txt-green"> $</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TabPanel>
                            <TabPanel>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Placement</th>
                                            <th>Highest bid per token</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {statistics.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.rank + ". " + item.placement}</td>
                                                <td>
                                                    {item.bid}
                                                    <span className="txt-green"> $</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TabPanel>
                        </Tabs>
                        <div className="timeframe-bar">
                            <div
                                className="timeleft"
                                style={{
                                    width: (percentage > 0 && percentage < 101? percentage : 0) + "%",
                                    background: "#464646",
                                }}
                            >
                                <div className="timeleft__value">
                                    {numberWithLength(parseInt(getTimeDiffOverall(fnSelectedRoundData()?.startedAt, fnSelectedRoundData()?.endedAt) / (60 * 60), 2))}:
                                    {numberWithLength(parseInt((getTimeDiffOverall(fnSelectedRoundData()?.startedAt, fnSelectedRoundData()?.endedAt) % (60 * 60)) / 60))}:
                                    {numberWithLength(parseInt(getTimeDiffOverall(fnSelectedRoundData()?.startedAt, fnSelectedRoundData()?.endedAt) % 60))}
                                </div>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between mt-4">
                            <div>
                                <p className="caption">Minimum bid</p>
                                <p className="value">15 ETH</p>
                            </div>
                            <div>
                                <p className="caption">Available Until</p>
                                {getTimeDiffOverall(fnSelectedRoundData()?.startedAt, fnSelectedRoundData()?.endedAt)<0 ? <p className="value"> No Data</p> : 
                                <p className="value">
                                    {numberWithLength(parseInt(new Date(fnSelectedRoundData()?.endedAt).getHours()))}:
                                    {numberWithLength(parseInt(new Date(fnSelectedRoundData()?.endedAt).getMinutes()))}:
                                    {numberWithLength(parseInt(new Date(fnSelectedRoundData()?.endedAt).getSeconds()))}
                                </p>}
                            </div>
                        </div>
                        {place_bid && (
                            <div className="text-center my-5">
                                <button
                                    className="btn-primary btn-increase"
                                    onClick={() => setState({ bidModal: true })}
                                >
                                    {!place_bid ? "Place Bid" : "Increase bid"}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="auction-right col-lg-8 col-md-7">
                        <div className={`place-bid ${place_bid && "d-none"}`}>
                            <h3 className="range-label">amount of Token</h3>
                            <div className="d-flex align-items-center mb-4">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setState({ amount: e.target.value })}
                                    className="range-input"
                                />
                                <Slider
                                    value={amount}
                                    onChange={(value) => setState({ amount: value })}
                                    min={1}
                                    max={fnSelectedRoundData()?.totalToken}
                                    step={1}
                                />
                            </div>
                            <h3 className="range-label">Per token price</h3>
                            <div className="d-flex align-items-center mb-4">
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setState({ price: e.target.value })}
                                    className="range-input"
                                />
                                <Slider
                                    value={price}
                                    onChange={(value) => setState({ price: value })}
                                    min={fnSelectedRoundData()?.minPrice}
                                    max={10000}
                                    step={100}
                                />
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="range-label">Total price</span>
                                <input
                                    className="total-input"
                                    type="text"
                                    value={numberWithCommas(price * amount, " ")}
                                    readOnly
                                />
                            </div>
                            <button
                                className="btn-primary text-uppercase w-100"
                                onClick={() => {
                                    

                                    // setState({ place_bid: true })
                                    // navigate("/payment")
                                    PlaceBid({
                                        variables: {
                                            roundId: fnSelectedRoundData()?.number,
                                            tokenAmount: amount,
                                            tokenPrice: price,
                                            payment: 1,
                                            cryptoType: "String",
                                        },
                                    })
                                }}
                            >
                                {!place_bid ? "Place Bid" : "Increase Bid"}
                            </button>
                        </div>
                        <div
                            className={`chart-area ${
                                size.width <= 768
                                    ? show_chart
                                        ? "d-block"
                                        : "d-none"
                                    : (size.width <= 1024 && size.width > 768 && "d-block") ||
                                      (place_bid && "d-block")
                            }`}
                        >
                            <div className="d-flex align-items-center">
                                <Select
                                    options={options}
                                    value={selectLabel}
                                    onChange={(v) => setState({ selectLabel: v })}
                                />
                                <img src={Qmark} alt="question" className="ms-3" />
                            </div>
                            <p className="select-label">{selectLabel.label}</p>
                            <ReactECharts
                                option={bidChartData}
                                style={{ height: "450px", width: "100%" }}
                                className="echarts-for-echarts"
                            />
                        </div>
                    </div>
                </div>
            </section>
            <Modal
                isOpen={bidModal}
                onRequestClose={() => setState({ bidModal: false })}
                ariaHideApp={false}
                className="place-bid"
                overlayClassName="place-bid__overlay"
            >
                <div className="tfa-modal__header">
                    <div
                        onClick={() => setState({ bidModal: false })}
                        onKeyDown={() => setState({ bidModal: false })}
                        role="button"
                        tabIndex="0"
                    >
                        <img width="14px" height="14px" src={CloseIcon} alt="close" />
                    </div>
                </div>
                <div className="desktop-view">
                    <h3 className="range-label">amount of Token</h3>
                    <div className="d-flex align-items-center mb-4">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setState({ amount: e.target.value })}
                            className="range-input"
                        />
                        <Slider
                            value={amount}
                            onChange={(value) => setState({ amount: value })}
                            min={0}
                            max={10000}
                            step={100}
                        />
                    </div>
                    <h3 className="range-label">Per token price</h3>
                    <div className="d-flex align-items-center mb-4">
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setState({ price: e.target.value })}
                            className="range-input"
                        />
                        <Slider
                            value={price}
                            onChange={(value) => setState({ price: value })}
                            min={0}
                            max={10000}
                            step={100}
                        />
                    </div>
                    <div className="d-flex align-items-center">
                        <span className="range-label">Total price</span>
                        <input
                            className="total-input"
                            type="number"
                            value={price * amount}
                            readOnly
                        />
                    </div>
                    <button
                        className="btn-primary text-uppercase w-100"
                        onClick={() => {
                            setState({ place_bid: true })
                            setState({ bidModal: false })
                        }}
                    >
                        {!place_bid ? "Place Bid" : "Increase Bid"}
                    </button>
                </div>
                <div className="tablet-view">
                    <h4 className="range-label">amount of Token</h4>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setState({ amount: e.target.value })}
                        placeholder="Type the Token Amount Here"
                        className="range-input"
                    />
                    <h4 className="range-label">Per token price</h4>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setState({ price: e.target.value })}
                        placeholder="Type the price per Token Here"
                        className="range-input"
                    />
                    <h4 className="range-label">Total price</h4>
                    <input className="total-input" type="number" value={price * amount} readOnly />
                    <button
                        className="btn-primary text-uppercase"
                        onClick={() => {
                            setState({ total: price * amount })
                            setState({ bidModal: false })
                            setState({ place_bid: true })
                            // navigate("/payment")
                        }}
                    >
                        {!place_bid ? "Place Bid" : "Increase Bid"}
                    </button>
                </div>
            </Modal>
        </main>
    )
}

export default Auction