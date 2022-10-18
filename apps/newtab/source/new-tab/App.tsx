import React, {
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
} from "react";
import {
    LindyIcon,
    TabbedContainer,
    useTabInfos,
    useArticleListsCache,
    StaticArticleList,
    getActivityColor,
    ReadingProgress,
    DraggableArticleList,
    DraggableContext,
    ArticleListsCache,
} from "@unclutter/library-components/dist/components";
import {
    Article,
    readingProgressFullClamp,
    ReplicacheContext,
    UserInfo,
} from "@unclutter/library-components/dist/store";
import {
    reportEventContentScript,
    ReplicacheProxy,
    getUnclutterExtensionId,
    subtractWeeks,
    getWeekStart,
} from "@unclutter/library-components/dist/common";

import { settingsStore, useSettings } from "../common/settings";

import "@unclutter/library-components/styles/globals.css";
import "@unclutter/library-components/styles/ArticlePreview.css";
import "@unclutter/library-components/styles/ProgressCircle.css";
import "./app.css";
import clsx from "clsx";

export default function App() {
    // send messages to main Unclutter extension directly by passing its id
    const rep = useMemo<ReplicacheProxy>(
        () => new ReplicacheProxy(getUnclutterExtensionId()),
        []
    );

    const [userInfo, setUserInfo] = useState<UserInfo>();
    useEffect(() => {
        rep.query.getUserInfo().then(setUserInfo);
    });
    if (!userInfo) {
        return <></>;
    }

    return (
        // @ts-ignore
        <ReplicacheContext.Provider value={rep}>
            <ArticleSection userInfo={userInfo} />
        </ReplicacheContext.Provider>
    );
}

function ArticleSection({
    userInfo,
    articleLines = 1,
}: {
    userInfo: UserInfo;
    articleLines?: number;
}) {
    // const tabInfos = useTabInfos(10, true, false, null, userInfo);
    // const [articleListsCache, setArticleListsCache] =
    //     useArticleListsCache(tabInfos);

    // const settings = useSettings(settingsStore);
    // const [initialIndex, setInitialIndex] = useState<number | null>();
    // useLayoutEffect(() => {
    //     if (tabInfos && settings) {
    //         if (settings.newtabActiveGroupKey === null) {
    //             setInitialIndex(null);
    //             return;
    //         }
    //         const index = tabInfos?.findIndex(
    //             (tab) => tab.key === settings.newtabActiveGroupKey
    //         );
    //         if (tabInfos[index]) {
    //             setInitialIndex(index);
    //         } else {
    //             setInitialIndex(0);
    //         }
    //     }
    // }, [tabInfos, settings]);

    const rep = useContext(ReplicacheContext);

    const [queuedArticles, setQueuedArticles] = useState<Article[]>([]);
    let [articleListsCache, setArticleListsCache] =
        useState<ArticleListsCache>();
    const [recentArticleCount, setRecentArticleCount] = useState<number>();
    const [recentReadArticleCount, setReadRecentArticleCount] =
        useState<number>();
    useEffect(() => {
        (async () => {
            const queuedArticles = await rep.query.listQueueArticles();
            setQueuedArticles(queuedArticles);
            setArticleListsCache({ queue: queuedArticles });

            const start = subtractWeeks(getWeekStart(), 3);
            const recentArticles = await rep.query.listRecentArticles(
                start.getTime()
            );
            const readArticles = recentArticles.filter(
                (a) => a.reading_progress >= readingProgressFullClamp
            );
            setRecentArticleCount(recentArticles.length);
            setReadRecentArticleCount(readArticles.length);
        })();
    }, [rep]);

    function reportEvent(...args: any[]) {
        reportEventContentScript(...args, getUnclutterExtensionId());
    }

    const color = getActivityColor(1, false);

    return (
        <div className="font-text text-base">
            <div className="mb-2 flex justify-end gap-3">
                <ReadingProgress
                    className="relative cursor-pointer rounded-lg px-2 py-1 hover:scale-[97%] hover:bg-stone-50"
                    articleCount={recentArticleCount}
                    readCount={recentReadArticleCount}
                    hideIfZero={false}
                    color={color}
                />
            </div>
            <div
                className="topic-articles animate-fadein relative rounded-lg p-3"
                style={{
                    height: `${
                        11.5 * articleLines - 0.75 * (articleLines - 1)
                    }rem`, // article height + padding to prevent size change
                    background: color,
                }}
            >
                <DraggableContext
                    articleLists={articleListsCache}
                    setArticleLists={setArticleListsCache}
                    reportEvent={reportEvent}
                >
                    {queuedArticles.length > 0 && (
                        <DraggableArticleList
                            listId="queue"
                            articlesToShow={6 * articleLines}
                            small
                            reportEvent={reportEvent}
                        />
                    )}

                    {queuedArticles.length === 0 && (
                        <div className="absolute top-0 left-0 flex h-full w-full select-none items-center justify-center">
                            <svg className="mr-2 h-4" viewBox="0 0 640 512">
                                <path
                                    fill="currentColor"
                                    d="M443.5 17.94C409.8 5.608 375.3 0 341.4 0C250.1 0 164.6 41.44 107.1 112.1c-6.752 8.349-2.752 21.07 7.375 24.68C303.1 203.8 447.4 258.3 618.4 319.1c1.75 .623 3.623 .9969 5.5 .9969c8.25 0 15.88-6.355 16-15.08C643 180.7 567.2 62.8 443.5 17.94zM177.1 108.4c42.88-36.51 97.76-58.07 154.5-60.19c-4.5 3.738-36.88 28.41-70.25 90.72L177.1 108.4zM452.6 208.1L307.4 155.4c14.25-25.17 30.63-47.23 48.13-63.8c25.38-23.93 50.13-34.02 67.51-27.66c17.5 6.355 29.75 29.78 33.75 64.42C459.6 152.4 457.9 179.6 452.6 208.1zM497.8 224.4c7.375-34.89 12.13-76.76 4.125-117.9c45.75 38.13 77.13 91.34 86.88 150.9L497.8 224.4zM576 488.1C576 501.3 565.3 512 552 512L23.99 510.4c-13.25 0-24-10.72-24-23.93c0-13.21 10.75-23.93 24-23.93l228 .6892l78.35-214.8l45.06 16.5l-72.38 198.4l248.1 .7516C565.3 464.1 576 474.9 576 488.1z"
                                />
                            </svg>
                            Your reading queue is empty.
                        </div>
                    )}
                </DraggableContext>
            </div>
        </div>
    );
}
