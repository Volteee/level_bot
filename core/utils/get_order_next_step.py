from core import models


def get_order_next_step(
    step: int,
    level: int,
    relation: models.Relation,
) -> int:
    if step == 4:
        return 5
    inspectors_map = [
        relation.first_inspector_id != None,
        relation.second_inspector_id != None,
        relation.third_inspector_id != None,
        relation.forth_inspector_id != None,
    ]
    for i in range(step, level):
        if inspectors_map[i]:
            return i+1
    return 5