export const etiquetteRulesData = [
  {
    "id": "decline_deal_rude_new_customer",
    "description": "Player rudely declines a deal offered by a new customer.",
    "trigger": {
      "event_type": "decline_deal_from_customer",
      "customer_is_new": true,
      "choice_style": "rude"
    },
    "impacts": {
      "streetCred_global_change": -2,
      "loyalty_change": -5,
      "target_type": "customer",
      "feedback_message_id": "feedback_decline_rude_new_customer"
    }
  },
  {
    "id": "decline_deal_polite_new_customer",
    "description": "Player politely declines a deal offered by a new customer.",
    "trigger": {
      "event_type": "decline_deal_from_customer",
      "customer_is_new": true,
      "choice_style": "polite"
    },
    "impacts": {
      "streetCred_global_change": 1,
      "loyalty_change": 2,
      "target_type": "customer",
      "feedback_message_id": "feedback_decline_polite_new_customer"
    }
  },
  {
    "id": "fair_price_during_shortage",
    "description": "Player sells a high-demand item at a reasonable price during a shortage.",
    "trigger": {
      "event_type": "sell_to_customer_success",
      "item_demand": "high",
      "world_event_active": "shortage_generic"
    },
    "impacts": {
      "streetCred_global_change": 2,
      "loyalty_change": 3,
      "target_type": "customer",
      "feedback_message_id": "feedback_fair_price_shortage"
    }
  },
  {
    "id": "price_gouge_during_shortage",
    "description": "Player significantly price gouges a high-demand item during a shortage.",
    "trigger": {
      "event_type": "sell_to_customer_success",
      "item_demand": "high",
      "world_event_active": "shortage_generic",
      "price_ratio_to_base": ">1.8"
    },
    "impacts": {
      "streetCred_global_change": -3,
      "loyalty_change": -5,
      "target_type": "customer",
      "feedback_message_id": "feedback_price_gouge_shortage"
    }
  }
];
