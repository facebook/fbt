/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 */

const {
  jsCodeFbtCallSerializer,
  snapshotTransform,
  withFbtRequireStatement,
} = require('../FbtTestUtil');
const {TestUtil} = require('fb-babel-plugin-utils');

expect.addSnapshotSerializer(jsCodeFbtCallSerializer);

const testData = {
  'should auto wrap a simple test with one level': {
    input: withFbtRequireStatement(
      `<fbt desc="d">
        <link href="#">Your friends</link>
        liked your video
      </fbt>;`,
    ),
  },

  'should auto wrap a simple test with a nested level': {
    input: withFbtRequireStatement(
      `<fbt desc="d">
        <Link href="#">
          Your friends
          <b>liked</b>
        </Link>
        your video
      </fbt>;`,
    ),
  },
};

// TODO(T40113359) Re-enable once this test scenario is ready to be tested
xdescribe('Test jsx auto-wrapping of implicit parameters', () =>
  TestUtil.testSection(testData, snapshotTransform, {matchSnapshot: true}));

// TODO(T40113359) Re-enable once this test scenario is ready to be tested
xdescribe('Equality between auto-wrapped and manually wrapped params', () => {
  it('should wrap a single unwrapped <fbt> child and a string above', () => {
    expect(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <fbt:param name="=This is a nested">
              <b>
                <fbt desc='In the phrase: "{=This is a nested} test"'>
                  This is
                  <fbt:param name="=a nested">
                    <link href="#">
                      <fbt desc='In the phrase: "This is {=a nested} test"'>
                        a nested
                      </fbt>
                    </link>
                  </fbt:param>
                </fbt>
              </b>
            </fbt:param>
            test
          </fbt>;`,
        ),
      ),
    ).toEqual(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <b>
              This is
              <link href="#">a nested</link>
            </b>
            test
          </fbt>;`,
        ),
      ),
    );
  });

  it('should wrap a single unwrapped <fbt> child and a string below', () => {
    expect(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <div href="#">this is</div>
            a singly nested test
          </fbt>;`,
        ),
      ),
    ).toEqual(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <fbt:param name="=this is">
              <div href="#">
                <fbt desc='In the phrase: "{=this is} a singly nested test"'>
                  this is
                </fbt>
              </div>
            </fbt:param>
            a singly nested test
          </fbt>;`,
        ),
      ),
    );
  });

  it('should wrap two unwrapped <fbt> children', () => {
    expect(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <div>wrap once</div>
            <div>wrap twice</div>
          </fbt>;`,
        ),
      ),
    ).toEqual(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <fbt:param name="=wrap once">
              <div>
                <fbt desc='In the phrase: "{=wrap once}{=wrap twice}"'>
                  wrap once
                </fbt>
              </div>
            </fbt:param>
            <fbt:param name="=wrap twice">
              <div>
                <fbt desc='In the phrase: "{=wrap once}{=wrap twice}"'>
                  wrap twice
                </fbt>
              </div>
            </fbt:param>
          </fbt>;`,
        ),
      ),
    );
  });

  it('should wrap two unwrapped <fbt> children and 1 nested', () => {
    expect(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <div>
              wrap once
              <div>and also</div>
            </div>
            <div>wrap twice</div>
            complicated
          </fbt>;`,
        ),
      ),
    ).toEqual(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <fbt:param name="=wrap once and also">
              <div>
                <fbt desc='In the phrase: "{=wrap once and also}{=wrap twice} complicated"'>
                  wrap once
                  <fbt:param name="=and also">
                    <div>
                      <fbt desc='In the phrase: "wrap once {=and also}{=wrap twice} complicated"'>
                        and also
                      </fbt>
                    </div>
                  </fbt:param>
                </fbt>
              </div>
            </fbt:param>
            <fbt:param name="=wrap twice">
              <div>
                <fbt desc='In the phrase: "{=wrap once and also}{=wrap twice} complicated"'>
                  wrap twice
                </fbt>
              </div>
            </fbt:param>
            complicated
          </fbt>;`,
        ),
      ),
    );
  });

  it('should wrap an outer and inner child', () => {
    expect(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <div href="#">
              <div href="#">this is</div>
              a doubly
            </div>
            nested test
          </fbt>;`,
        ),
      ),
    ).toEqual(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <fbt:param name="=this is a doubly">
              <div href="#">
                <fbt desc='In the phrase: "{=this is a doubly} nested test"'>
                  <fbt:param name="=this is">
                    <div href="#">
                      <fbt desc='In the phrase: "{=this is} a doubly nested test"'>
                        this is
                      </fbt>
                    </div>
                  </fbt:param>
                  a doubly
                </fbt>
              </div>
            </fbt:param>
            nested test
          </fbt>;`,
        ),
      ),
    );
  });

  it('should wrap two children with one nested level', () => {
    expect(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <div href="#">
              <div href="#">this is</div>
              a doubly
            </div>
            nested test
            <div href="#">with an additional level</div>
          </fbt>;`,
        ),
      ),
    ).toEqual(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <fbt:param name="=this is a doubly">
              <div href="#">
                <fbt desc='In the phrase: "{=this is a doubly} nested test {=with an additional level}"'>
                  <fbt:param name="=this is">
                    <div href="#">
                      <fbt desc='In the phrase: "{=this is} a doubly nested test {=with an additional level}"'>
                        this is
                      </fbt>
                    </div>
                  </fbt:param>
                  a doubly
                </fbt>
              </div>
            </fbt:param>
            nested test
            <fbt:param name="=with an additional level">
              <div href="#">
                <fbt desc='In the phrase: "{=this is a doubly} nested test {=with an additional level}"'>
                  with an additional level
                </fbt>
              </div>
            </fbt:param>
          </fbt>;`,
        ),
      ),
    );
  });

  it('should wrap a <fbt> child next to an explicit <fbt:param>', () => {
    expect(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <fbt:param name="explicit param next to">
              <div>
                <fbt desc="d2">explicit param next to</fbt>
              </div>
            </fbt:param>
            <div>an implicit param</div>
          </fbt>;`,
        ),
      ),
    ).toEqual(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <fbt:param name="explicit param next to">
              <div>
                <fbt desc="d2">explicit param next to</fbt>
              </div>
            </fbt:param>
            <fbt:param name="=an implicit param">
              <div>
                <fbt desc='In the phrase: "{=explicit param next to}{=an implicit param}"'>
                  an implicit param
                </fbt>
              </div>
            </fbt:param>
          </fbt>;`,
        ),
      ),
    );
  });

  it('should wrap a <fbt> child nested in an explicit <fbt:param>', () => {
    expect(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <fbt:param name="explicit fbt param">
              <div>
                <fbt desc="d2">
                  explicit fbt param
                  <div>with a nested implicit param</div>
                </fbt>
              </div>
            </fbt:param>
          </fbt>;`,
        ),
      ),
    ).toEqual(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <fbt:param name="explicit fbt param">
              <div>
                <fbt desc="d2">
                  explicit fbt param
                  <fbt:param name="=with a nested implicit param">
                    <div>
                      <fbt desc='In the phrase: "explicit fbt param {=with a nested implicit param}"'>
                        with a nested implicit param
                      </fbt>
                    </div>
                  </fbt:param>
                </fbt>
              </div>
            </fbt:param>
          </fbt>;`,
        ),
      ),
    );
  });

  it(
    'should wrap a string next to an explicit <fbt:param> that has a' +
      'implicit <fbt:param> within it',
    () => {
      expect(
        snapshotTransform(
          withFbtRequireStatement(
            `<fbt desc="d">
              outer string that should not appear in inner desc
              <fbt:param name="explicit fbt param">
                <div>
                  <fbt desc="d2">
                    explicit fbt param
                    <div>with a nested implicit param</div>
                  </fbt>
                </div>
              </fbt:param>
            </fbt>;`,
          ),
        ),
      ).toEqual(
        snapshotTransform(
          withFbtRequireStatement(
            `<fbt desc="d">
              outer string that should not appear in inner desc
              <fbt:param name="explicit fbt param">
                <div>
                  <fbt desc="d2">
                    explicit fbt param
                    <fbt:param name="=with a nested implicit param">
                      <div>
                        <fbt desc='In the phrase: "explicit fbt param {=with a nested implicit param}"'>
                          with a nested implicit param
                        </fbt>
                      </div>
                    </fbt:param>
                  </fbt>
                </div>
              </fbt:param>
            </fbt>;`,
          ),
        ),
      );
    },
  );

  it('should work with multiple <fbt> calls in one file', () => {
    expect(
      snapshotTransform(
        withFbtRequireStatement(
          `<div>
            <fbt desc="one">
              <div href="#">first</div>
              fbt call
            </fbt>
            <fbt desc="two">
              <div href="#">second</div>
              test
            </fbt>
          </div>;`,
        ),
      ),
    ).toEqual(
      snapshotTransform(
        withFbtRequireStatement(
          `<div>
            <fbt desc="one">
              <fbt:param name="=first">
                <div href="#">
                  <fbt desc='In the phrase: "{=first} fbt call"'>first</fbt>
                </div>
              </fbt:param>
              fbt call
            </fbt>
            <fbt desc="two">
              <fbt:param name="=second">
                <div href="#">
                  <fbt desc='In the phrase: "{=second} test"'>second</fbt>
                </div>
              </fbt:param>
              test
            </fbt>
          </div>;`,
        ),
      ),
    );
  });

  it('should wrap two nested next to each other', () => {
    expect(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <div href="#">
              one
              <div href="#">two</div>
            </div>
            <div href="#">
              three
              <div href="#">four</div>
            </div>
          </fbt>;`,
        ),
      ),
    ).toEqual(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <fbt:param name="=one two">
              <div href="#">
                <fbt desc='In the phrase: "{=one two}{=three four}"'>
                  one
                  <fbt:param name="=two">
                    <div href="#">
                      <fbt desc='In the phrase: "one {=two}{=three four}"'>
                        two
                      </fbt>
                    </div>
                  </fbt:param>
                </fbt>
              </div>
            </fbt:param>
            <fbt:param name="=three four">
              <div href="#">
                <fbt desc='In the phrase: "{=one two}{=three four}"'>
                  three
                  <fbt:param name="=four">
                    <div href="#">
                      <fbt desc='In the phrase: "{=one two}three {=four}"'>
                        four
                      </fbt>
                    </div>
                  </fbt:param>
                </fbt>
              </div>
            </fbt:param>
          </fbt>;`,
        ),
      ),
    );
  });

  it('should wrap two nested next to each other with an extra level', () => {
    expect(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <div href="#">
              one
              <div href="#">
                two
                <div href="#">test</div>
              </div>
            </div>
            <div href="#">
              three
              <div href="#">four</div>
            </div>
          </fbt>;`,
        ),
      ),
    ).toEqual(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <fbt:param name="=one two test">
              <div href="#">
                <fbt desc='In the phrase: "{=one two test}{=three four}"'>
                  one
                  <fbt:param name="=two test">
                    <div href="#">
                      <fbt desc='In the phrase: "one {=two test}{=three four}"'>
                        two
                        <fbt:param name="=test">
                          <div href="#">
                            <fbt desc='In the phrase: "one two {=test}{=three four}"'>
                              test
                            </fbt>
                          </div>
                        </fbt:param>
                      </fbt>
                    </div>
                  </fbt:param>
                </fbt>
              </div>
            </fbt:param>
            <fbt:param name="=three four">
              <div href="#">
                <fbt desc='In the phrase: "{=one two test}{=three four}"'>
                  three
                  <fbt:param name="=four">
                    <div href="#">
                      <fbt desc='In the phrase: "{=one two test}three {=four}"'>
                        four
                      </fbt>
                    </div>
                  </fbt:param>
                </fbt>
              </div>
            </fbt:param>
          </fbt>;`,
        ),
      ),
    );
  });

  it('should wrap explicit params nested in implicit params with []', () => {
    expect(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <div>
              this is a test
              <fbt:param name="to make sure that explicit params under an implicit node">
                <link>
                  <fbt desc="d2">
                    to make sure that explicit tags
                    <b>under an implicit node</b>
                  </fbt>
                </link>
              </fbt:param>
              <fbt:param name="and ones that are next to each other">
                <link>
                  <fbt desc="d3">
                    and ones that are next
                    <b>to each other</b>
                  </fbt>
                </link>
              </fbt:param>
              under an implicit tag are wrapped with [ ]
            </div>
            <fbt:param name="but free standing ones are not">
              <link>
                <fbt desc="d3">
                  but free standing ones
                  <b>are not</b>
                </fbt>
              </link>
            </fbt:param>
          </fbt>;`,
        ),
      ),
    ).toEqual(
      snapshotTransform(
        withFbtRequireStatement(
          `<fbt desc="d">
            <fbt:param name="=this is a test [to make sure that explicit params under an implicit node][and ones that are next to each other] under an implicit tag are wrapped with [ ]">
              <div>
                <fbt desc='In the phrase: "{=this is a test [to make sure that explicit params under an implicit node][and ones that are next to each other] under an implicit tag are wrapped with [ ]}{=but free standing ones are not}"'>
                  this is a test
                  <fbt:param name="to make sure that explicit params under an implicit node">
                    <link>
                      <fbt desc="d2">
                        to make sure that explicit tags
                        <b>under an implicit node</b>
                      </fbt>
                    </link>
                  </fbt:param>
                  <fbt:param name="and ones that are next to each other">
                    <link>
                      <fbt desc="d3">
                        and ones that are next
                        <b>to each other</b>
                      </fbt>
                    </link>
                  </fbt:param>
                  under an implicit tag are wrapped with [ ]
                </fbt>
              </div>
            </fbt:param>
            <fbt:param name="but free standing ones are not">
              <link>
                <fbt desc="d3">
                  but free standing ones
                  <b>are not</b>
                </fbt>
              </link>
            </fbt:param>
          </fbt>;`,
        ),
      ),
    );
  });
});
