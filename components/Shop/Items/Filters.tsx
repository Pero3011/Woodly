import FilterCard from "./FilterCard"
import { Filter } from "lucide-react"
export default function Filters() {
    return (
        <div className="flex gap-3 items-center pb-10">
            <FilterCard FilterType={"Category"} FilteredBy={"Dinning Table"} />
            <button className="flex">
                Clear Filters
                <Filter/>
            </button>
        </div>
    )
}