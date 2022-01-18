import { gql } from "@apollo/client"

export const GET_AUCTION = gql`
    query {
        getAuctions {
            round
            startedAt
            endedAt
            totalToken
            minPrice
            token
            sold
            status
        }
    }
`

export const GET_BIDLIST_BY_ROUND = gql`
    query getBidListByRound($round: Int!) {
        getBidListByRound(round: $round) {
            userId
            prefix
            name
            roundId
            tokenAmount
            totalPrice
            tokenPrice
            tempTokenAmount
            tempTokenPrice
            delta
            pendingIncrease
            holdings {
                key
                value {
                    crypto
                    usd
                }
            }
            payType
            cryptoType
            placedAt
            updatedAt
            status
        }
    }
`

export const GET_AUCTION_BY_NUMBER = gql`
    query getAuctionByNumber($round: Int!) {
        getAuctionByNumber(round: $round) {
            id
            regDate
            updateDate
            deleted
            round
            startedAt
            endedAt
            totalToken
            minPrice
            avatar {
                id
                regDate
                updateDate
                deleted
                groupId
                compId
            }
            token
            sold
            stats {
                qty
                win
                fail
            }
            status
        }
    }
`
export const GET_AUCTION_BY_STATUS = gql`
    query getAuctionByStatus($status: Int!) {
        getAuctionByStatus(status: $status) {
            number
            token
            status
        }
    }
`

export const GET_BID_LIST = gql`
    query GetBidList {
        getBidList {
            tokenAmount
            totalPrice
            placedAt
        }
    }
`
