/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noflow
 * @emails oncall+internationalization
 */

import React from "react";
import Highlight, { defaultProps } from "prism-react-renderer";

const CodeBlock = ({ code }) => (
  <Highlight {...defaultProps} code={code} language="jsx">
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <pre className={className} style={{ ...style, textAlign: "left" }}>
        {tokens.map((line, i) => (
          <div {...getLineProps({ line, key: i })}>
            {line.map((token, key) => (
              <span {...getTokenProps({ token, key })} />
            ))}
          </div>
        ))}
      </pre>
    )}
  </Highlight>
);

export default CodeBlock;
