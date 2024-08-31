CREATE MIGRATION m13zznvhqndp4yzp72mmd5dy3byzeymcjoq542lfmep2i2wzdh53ua
    ONTO m1ginewxse7iopazx7crgvh5thvykxa6zafj64lpfrru6tgr2dr5yq
{
  ALTER TYPE default::ModelIteration {
      CREATE PROPERTY time_to_generate: std::int32;
  };
};
