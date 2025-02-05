import FiltersSkeleton from "@/components/loading/FiltersSkeleton";
import LoadingList from "@/components/loading/LoadingList";
import React from "react";

export default function loading() {
  return (
    <div className="pt-10 w-full">
      <div className="w-full bg-yellow-100 h-[250px] p-10 mb-5">
        <h1 className="w-[300px] text-left h-10 bg-gray-200 rounded-2xl font-bold text-5xl mb-10"></h1>
      </div>
      <div className="w-full flex flex-col items-center gap-16">
        <div className="w-full flex flex-row gap-5">
          <div id="filters" className="hidden lg:block lg:w-1/4">
            <FiltersSkeleton />
          </div>
          <div id="event-list" className="w-full lg:w-3/4">
            <LoadingList eventsPerPage={10} />
          </div>
        </div>
      </div>
    </div>
  );
}
