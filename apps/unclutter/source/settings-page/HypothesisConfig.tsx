import React from "react";
import { getHypothesisToken, validateSaveToken } from "../common/annotations/storage";
import { createRemoteAnnotation } from "../sidebar/common/api";
import { deleteAllLegacyAnnotations, getAllLegacyAnnotations } from "../sidebar/common/legacy";

export default function HypothesisConfig() {
    const [token, setToken] = React.useState("");
    React.useEffect(() => {
        (async function () {
            const existingToken = await getHypothesisToken();
            setToken(existingToken);
        })();
    }, []);

    const [tokenValid, setTokenValid] = React.useState("");
    React.useEffect(() => {
        (async function () {
            if (token === "") {
                return;
            }

            const tokenValid = await validateSaveToken(token, true);
            setTokenValid(tokenValid);
        })();
    }, [token]);

    // if this renders, the user has enabled the hypothesis sync
    // so upload & delete local annotations once token valid
    // TODO: user may exit settings before uploaded, which will create duplicate annotations
    React.useEffect(() => {
        (async function () {
            if (!tokenValid) {
                return;
            }

            const localAnnotations = await getAllLegacyAnnotations();
            if (localAnnotations.length === 0) {
                return;
            }

            console.log(`Uploading ${localAnnotations.length} local annotations...`);
            await Promise.all(localAnnotations.map(createRemoteAnnotation));

            await deleteAllLegacyAnnotations();
        })();
    }, [tokenValid]);

    return (
        <div className="flex items-center gap-2">
            <p className="mb-1">
                Your{" "}
                <a
                    className="underline"
                    href="https://hypothes.is/account/developer"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    API token
                </a>
                :
            </p>
            <input
                className={
                    "flex-grow rounded border-2 py-1 px-2 shadow-inner outline-none " +
                    (tokenValid
                        ? "border-green-300 dark:border-green-500"
                        : "border-red-300 dark:border-red-500")
                }
                style={{ background: "var(--embedded-background)" }}
                placeholder="Hypothes.is API token"
                spellCheck="false"
                value={token}
                onChange={(e) => setToken(e.target.value)}
            />
        </div>
    );
}
