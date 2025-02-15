import React, { ReactNode } from "react";
import { useContext, useEffect, useState } from "react";

import { ReplicacheContext } from "../../store";
import { getWeekStart } from "../../common";
import { ResourceStat } from "./components/numbers";

export default function HeaderBar({
    articleCount,
    currentTab,
    setCurrentTab,
}: {
    articleCount?: number;
    currentTab: string;
    setCurrentTab: (tab: string) => void;
}) {
    return (
        <div className="header-bar mb-4 flex w-full gap-4 rounded-t-lg">
            <div className="flex-grow">
                <input
                    className="font-text w-full max-w-[30.25rem] rounded-md bg-stone-50 px-3 py-1.5 font-medium leading-none placeholder-stone-300 outline-none dark:bg-neutral-800 dark:placeholder-neutral-600"
                    spellCheck="false"
                    autoFocus
                    placeholder={articleCount ? `Search across ${articleCount} articles...` : ""}
                />
            </div>

            <StatsHeader onClick={() => setCurrentTab("stats")} />

            {/* <ProgressSteps
                current={weekArticleCount || 0}
                target={6}
                // isSelected={currentTab === "stats"}
                onClick={() => setCurrentTab("stats")}
            /> */}

            {/* <InlineProgressCircle
                    current={weekArticleCount}
                    target={10}
                    className="w-8"
                /> */}
        </div>
    );
}

function StatsHeader({ onClick }: { onClick: () => void }) {
    const rep = useContext(ReplicacheContext);
    const [weekArticleCount, setWeekArticleCount] = useState<number>();
    useEffect(() => {
        if (!rep) {
            return;
        }

        rep.query
            .listRecentArticles(getWeekStart().getTime())
            .then((articles) => setWeekArticleCount(articles.length));
    }, [rep]);

    return (
        <div
            className="flex cursor-pointer gap-3 rounded-md px-2 transition-all hover:scale-x-[99%] hover:scale-y-[97%] hover:bg-stone-50 dark:hover:bg-neutral-800"
            onClick={onClick}
        >
            <ResourceStat value={weekArticleCount} type="articles" large />
            {/* <ResourceStat
                value={weekArticleCount + 2}
                icon={
                    <svg className="h-4" viewBox="0 0 640 512">
                        <path
                            fill="currentColor"
                            d="M443.5 17.94C409.8 5.608 375.3 0 341.4 0C250.1 0 164.6 41.44 107.1 112.1c-6.752 8.349-2.752 21.07 7.375 24.68C303.1 203.8 447.4 258.3 618.4 319.1c1.75 .623 3.623 .9969 5.5 .9969c8.25 0 15.88-6.355 16-15.08C643 180.7 567.2 62.8 443.5 17.94zM177.1 108.4c42.88-36.51 97.76-58.07 154.5-60.19c-4.5 3.738-36.88 28.41-70.25 90.72L177.1 108.4zM452.6 208.1L307.4 155.4c14.25-25.17 30.63-47.23 48.13-63.8c25.38-23.93 50.13-34.02 67.51-27.66c17.5 6.355 29.75 29.78 33.75 64.42C459.6 152.4 457.9 179.6 452.6 208.1zM497.8 224.4c7.375-34.89 12.13-76.76 4.125-117.9c45.75 38.13 77.13 91.34 86.88 150.9L497.8 224.4zM576 488.1C576 501.3 565.3 512 552 512L23.99 510.4c-13.25 0-24-10.72-24-23.93c0-13.21 10.75-23.93 24-23.93l228 .6892l78.35-214.8l45.06 16.5l-72.38 198.4l248.1 .7516C565.3 464.1 576 474.9 576 488.1z"
                        />
                    </svg>
                }
                large
            /> */}
            <ResourceStat value={0} type="highlights" large />
        </div>
    );
}
