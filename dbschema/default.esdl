module default {
    type Model {
        required title: str;
        required description: str;
        required created_at: datetime {
            default := std::datetime_current();
            readonly := true;
        };
        multi iterations: ModelIteration;
    }

    type ModelIteration {
        required number: int32;
        required code: str;
        required created_at: datetime {
            default := std::datetime_current();
            readonly := true;
        };
    }
}
