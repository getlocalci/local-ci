import getImageFromJob from 'containerization/getImageFromJob';

describe('getImageFromJob', () => {
  test('no docker value', () => {
    expect(getImageFromJob({ working_directory: 'foo/baz' })).toEqual('');
  });

  test('empty docker array', () => {
    expect(getImageFromJob({ docker: [] })).toEqual('');
  });

  test('with docker image', () => {
    expect(getImageFromJob({ docker: [{ image: 'foo-image' }] })).toEqual(
      'foo-image'
    );
  });
});
