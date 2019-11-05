/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 */
import {Tiger, hashPhrases} from 'fb-tiger-hash'

hashPhrases([{
  desc: "d",
  texts: ["a", "b", "c"]
}]);

(new Tiger(Tiger.L128, 0, true, Tiger.UTF8)).hash('foo');
