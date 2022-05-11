import React from "react";
import { LindyAnnotation } from "../../common/annotations/create";
import AnnotationThread from "./AnnotationThread";

function AnnotationsList({
    url,
    annotations,
    onClick = null,
    deleteHideAnnotation,
    upvotedAnnotations = {},
    upvoteAnnotation = null,
    offsetTop = 0,
    onAnnotationHoverUpdate,
    hypothesisSyncEnabled,
    createReply,
}) {
    if (!annotations) {
        return <div></div>;
    }

    const orderedAnnotations = annotations
        .filter((a) => a.displayOffset)
        .sort((a, b) => a.displayOffset - b.displayOffset);

    // group annotations that are close together
    const groupMargin = 100;
    let groupedAnnotations: LindyAnnotation[][] = [];
    let lastOffset = -Infinity;
    for (const annotation of orderedAnnotations) {
        if (annotation.displayOffset < lastOffset + groupMargin) {
            // conflict, append to last group
            groupedAnnotations[groupedAnnotations.length - 1] = [
                ...groupedAnnotations[groupedAnnotations.length - 1],
                annotation,
            ];
        } else {
            // no conflict, start new group
            groupedAnnotations.push([annotation]);
        }
        lastOffset = annotation.displayOffsetEnd;
    }

    // take best comment from each group
    groupedAnnotations = groupedAnnotations.map((groupList) =>
        groupList
            .sort((a, b) => {
                // prefer more replies
                if (b.reply_count !== a.reply_count) {
                    return b.reply_count - a.reply_count;
                }

                // prefer longer comments
                return b.text.length - a.text.length;
            })
            .slice(0, 1)
    );

    return (
        <div className="relative flex-grow" onClick={onClick}>
            {groupedAnnotations.map((group, groupIndex) => (
                <AnnotationGroup
                    key={group[0].localId}
                    group={group}
                    nextGroup={
                        groupIndex < groupedAnnotations.length - 1 &&
                        groupedAnnotations[groupIndex + 1]
                    }
                    deleteHideAnnotation={deleteHideAnnotation}
                    offsetTop={50}
                    onAnnotationHoverUpdate={onAnnotationHoverUpdate}
                    hypothesisSyncEnabled={hypothesisSyncEnabled}
                    createReply={createReply}
                    // upvotedAnnotations={upvotedAnnotations}
                    // upvoteAnnotation={upvoteAnnotation}
                />
            ))}
        </div>
    );
}
export default AnnotationsList;

function AnnotationGroup({
    group,
    nextGroup,
    deleteHideAnnotation,
    upvotedAnnotations = {},
    upvoteAnnotation = null,
    offsetTop = 0,
    onAnnotationHoverUpdate,
    hypothesisSyncEnabled,
    createReply,
}) {
    return (
        <div
            className="absolute w-full"
            style={{
                top: group[0].displayOffset - offsetTop,
                position: "relative",
            }}
        >
            {group.map((annotation, annotationIndex) => {
                return (
                    <div
                        key={annotation.localId}
                        className={
                            "annotation-group-item w-full rounded-r " +
                            (group.length > 1
                                ? "hover:z-10 hover:drop-shadow"
                                : "")
                        }
                        style={{
                            position: "absolute",
                            top: `${annotationIndex * 40}px`,
                        }}
                    >
                        <AnnotationThread
                            annotation={annotation}
                            deleteHideAnnotation={deleteHideAnnotation}
                            heightLimitPx={
                                nextGroup &&
                                nextGroup[0].displayOffset -
                                    group[0].displayOffset
                            }
                            upvoted={upvotedAnnotations[annotation.id]}
                            // upvoteAnnotation={(isUpvote) =>
                            //     upvoteAnnotation(
                            //         url,
                            //         annotation.id,
                            //         isUpvote
                            //     )
                            // }
                            onHoverUpdate={(hoverActive: boolean) =>
                                // call hover on top level annotation
                                onAnnotationHoverUpdate(annotation, hoverActive)
                            }
                            hypothesisSyncEnabled={hypothesisSyncEnabled}
                            createReply={createReply}
                        />
                    </div>
                );
            })}
        </div>
    );
}
