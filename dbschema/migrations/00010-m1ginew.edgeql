CREATE MIGRATION m1ginewxse7iopazx7crgvh5thvykxa6zafj64lpfrru6tgr2dr5yq
    ONTO m1zy42g3osrmv7ihhas4hartpgnuf6hhsptob766afqr3plwjwyweq
{
  ALTER TYPE default::Model {
      CREATE REQUIRED PROPERTY images: array<std::str> {
          SET REQUIRED USING (<array<std::str>>{});
      };
  };
};
