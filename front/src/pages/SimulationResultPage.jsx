import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    Box, Container, Paper, Typography, Grid, Chip, Button, Divider
} from '@mui/material'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts'
import { pln, pct } from '../utils/formatters'

export default function SimulationResultPage() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const request = state?.request
    const response = state?.response

    return <Typography>
        TODO to be completed
    </Typography>
}
