"use client";

import { useState, useCallback } from "react";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

type QuizDirection = "ko-fr" | "fr-ko";

type Question = {
  question: string;
  correct: string;
  choices: string[];
  direction: QuizDirection;
};

// Common Korean vocabulary for random quizzes - Extended vocabulary (~300 words)
const VOCABULARY: Array<{ ko: string; fr: string; category: string }> = [
  // ============ SALUTATIONS & EXPRESSIONS ============
  { ko: "안녕하세요", fr: "Bonjour", category: "salutations" },
  { ko: "감사합니다", fr: "Merci", category: "salutations" },
  {
    ko: "안녕히 가세요",
    fr: "Au revoir (à celui qui part)",
    category: "salutations",
  },
  {
    ko: "안녕히 계세요",
    fr: "Au revoir (à celui qui reste)",
    category: "salutations",
  },
  { ko: "네", fr: "Oui", category: "basics" },
  { ko: "아니요", fr: "Non", category: "basics" },
  { ko: "죄송합니다", fr: "Je suis désolé", category: "salutations" },
  { ko: "실례합니다", fr: "Excusez-moi", category: "salutations" },
  {
    ko: "괜찮아요",
    fr: "C'est bon / Pas de problème",
    category: "expressions",
  },
  { ko: "잠시만요", fr: "Un instant s'il vous plaît", category: "expressions" },
  { ko: "천만에요", fr: "De rien", category: "salutations" },
  { ko: "반갑습니다", fr: "Enchanté", category: "salutations" },
  { ko: "안녕", fr: "Salut (informel)", category: "salutations" },
  { ko: "고마워", fr: "Merci (informel)", category: "salutations" },
  { ko: "미안해", fr: "Pardon (informel)", category: "salutations" },
  { ko: "뭐", fr: "Quoi", category: "expressions" },
  { ko: "왜", fr: "Pourquoi", category: "expressions" },
  { ko: "어디", fr: "Où", category: "expressions" },
  { ko: "언제", fr: "Quand", category: "expressions" },
  { ko: "어떻게", fr: "Comment", category: "expressions" },
  { ko: "누구", fr: "Qui", category: "expressions" },
  { ko: "얼마", fr: "Combien (prix)", category: "expressions" },
  { ko: "맞아요", fr: "C'est vrai / Exact", category: "expressions" },
  { ko: "아마", fr: "Peut-être", category: "expressions" },
  { ko: "정말", fr: "Vraiment", category: "expressions" },
  { ko: "진짜", fr: "Vraiment (familier)", category: "expressions" },

  // ============ FAMILLE ============
  { ko: "가족", fr: "Famille", category: "famille" },
  { ko: "아버지", fr: "Père (formel)", category: "famille" },
  { ko: "아빠", fr: "Papa", category: "famille" },
  { ko: "어머니", fr: "Mère (formel)", category: "famille" },
  { ko: "엄마", fr: "Maman", category: "famille" },
  { ko: "형", fr: "Grand frère (pour un homme)", category: "famille" },
  { ko: "오빠", fr: "Grand frère (pour une femme)", category: "famille" },
  { ko: "누나", fr: "Grande sœur (pour un homme)", category: "famille" },
  { ko: "언니", fr: "Grande sœur (pour une femme)", category: "famille" },
  { ko: "동생", fr: "Petit frère ou petite sœur", category: "famille" },
  { ko: "남동생", fr: "Petit frère", category: "famille" },
  { ko: "여동생", fr: "Petite sœur", category: "famille" },
  { ko: "할머니", fr: "Grand-mère", category: "famille" },
  { ko: "할아버지", fr: "Grand-père", category: "famille" },
  { ko: "부모님", fr: "Parents", category: "famille" },
  { ko: "아들", fr: "Fils", category: "famille" },
  { ko: "딸", fr: "Fille (enfant)", category: "famille" },
  { ko: "남편", fr: "Mari", category: "famille" },
  { ko: "아내", fr: "Épouse", category: "famille" },
  { ko: "삼촌", fr: "Oncle", category: "famille" },
  { ko: "이모", fr: "Tante (côté maternel)", category: "famille" },
  { ko: "고모", fr: "Tante (côté paternel)", category: "famille" },
  { ko: "사촌", fr: "Cousin(e)", category: "famille" },
  { ko: "조카", fr: "Neveu / Nièce", category: "famille" },

  // ============ NOMBRES CORÉENS NATIFS ============
  { ko: "하나", fr: "Un (coréen natif)", category: "nombres" },
  { ko: "둘", fr: "Deux (coréen natif)", category: "nombres" },
  { ko: "셋", fr: "Trois (coréen natif)", category: "nombres" },
  { ko: "넷", fr: "Quatre (coréen natif)", category: "nombres" },
  { ko: "다섯", fr: "Cinq (coréen natif)", category: "nombres" },
  { ko: "여섯", fr: "Six (coréen natif)", category: "nombres" },
  { ko: "일곱", fr: "Sept (coréen natif)", category: "nombres" },
  { ko: "여덟", fr: "Huit (coréen natif)", category: "nombres" },
  { ko: "아홉", fr: "Neuf (coréen natif)", category: "nombres" },
  { ko: "열", fr: "Dix (coréen natif)", category: "nombres" },
  { ko: "스물", fr: "Vingt (coréen natif)", category: "nombres" },

  // ============ NOMBRES SINO-CORÉENS ============
  { ko: "일", fr: "Un (sino-coréen)", category: "nombres" },
  { ko: "이", fr: "Deux (sino-coréen)", category: "nombres" },
  { ko: "삼", fr: "Trois (sino-coréen)", category: "nombres" },
  { ko: "사", fr: "Quatre (sino-coréen)", category: "nombres" },
  { ko: "오", fr: "Cinq (sino-coréen)", category: "nombres" },
  { ko: "육", fr: "Six (sino-coréen)", category: "nombres" },
  { ko: "칠", fr: "Sept (sino-coréen)", category: "nombres" },
  { ko: "팔", fr: "Huit (sino-coréen)", category: "nombres" },
  { ko: "구", fr: "Neuf (sino-coréen)", category: "nombres" },
  { ko: "십", fr: "Dix (sino-coréen)", category: "nombres" },
  { ko: "백", fr: "Cent", category: "nombres" },
  { ko: "천", fr: "Mille", category: "nombres" },
  { ko: "만", fr: "Dix mille", category: "nombres" },

  // ============ JOURS DE LA SEMAINE ============
  { ko: "월요일", fr: "Lundi", category: "jours" },
  { ko: "화요일", fr: "Mardi", category: "jours" },
  { ko: "수요일", fr: "Mercredi", category: "jours" },
  { ko: "목요일", fr: "Jeudi", category: "jours" },
  { ko: "금요일", fr: "Vendredi", category: "jours" },
  { ko: "토요일", fr: "Samedi", category: "jours" },
  { ko: "일요일", fr: "Dimanche", category: "jours" },
  { ko: "주말", fr: "Week-end", category: "jours" },
  { ko: "평일", fr: "Jour de semaine", category: "jours" },

  // ============ TEMPS & PÉRIODES ============
  { ko: "오늘", fr: "Aujourd'hui", category: "temps" },
  { ko: "내일", fr: "Demain", category: "temps" },
  { ko: "어제", fr: "Hier", category: "temps" },
  { ko: "지금", fr: "Maintenant", category: "temps" },
  { ko: "아침", fr: "Matin", category: "temps" },
  { ko: "점심", fr: "Midi", category: "temps" },
  { ko: "저녁", fr: "Soir", category: "temps" },
  { ko: "밤", fr: "Nuit", category: "temps" },
  { ko: "시간", fr: "Temps / Heure", category: "temps" },
  { ko: "분", fr: "Minute", category: "temps" },
  { ko: "초", fr: "Seconde", category: "temps" },
  { ko: "주", fr: "Semaine", category: "temps" },
  { ko: "달", fr: "Mois", category: "temps" },
  { ko: "년", fr: "Année", category: "temps" },
  { ko: "올해", fr: "Cette année", category: "temps" },
  { ko: "작년", fr: "L'année dernière", category: "temps" },
  { ko: "내년", fr: "L'année prochaine", category: "temps" },
  { ko: "매일", fr: "Chaque jour", category: "temps" },
  { ko: "항상", fr: "Toujours", category: "temps" },
  { ko: "가끔", fr: "Parfois", category: "temps" },
  { ko: "자주", fr: "Souvent", category: "temps" },
  { ko: "나중에", fr: "Plus tard", category: "temps" },
  { ko: "이제", fr: "Maintenant / Désormais", category: "temps" },

  // ============ MOIS ============
  { ko: "일월", fr: "Janvier", category: "mois" },
  { ko: "이월", fr: "Février", category: "mois" },
  { ko: "삼월", fr: "Mars", category: "mois" },
  { ko: "사월", fr: "Avril", category: "mois" },
  { ko: "오월", fr: "Mai", category: "mois" },
  { ko: "유월", fr: "Juin", category: "mois" },
  { ko: "칠월", fr: "Juillet", category: "mois" },
  { ko: "팔월", fr: "Août", category: "mois" },
  { ko: "구월", fr: "Septembre", category: "mois" },
  { ko: "시월", fr: "Octobre", category: "mois" },
  { ko: "십일월", fr: "Novembre", category: "mois" },
  { ko: "십이월", fr: "Décembre", category: "mois" },

  // ============ LIEUX ============
  { ko: "한국", fr: "Corée", category: "lieux" },
  { ko: "서울", fr: "Séoul", category: "lieux" },
  { ko: "프랑스", fr: "France", category: "lieux" },
  { ko: "미국", fr: "États-Unis", category: "lieux" },
  { ko: "일본", fr: "Japon", category: "lieux" },
  { ko: "중국", fr: "Chine", category: "lieux" },
  { ko: "학교", fr: "École", category: "lieux" },
  { ko: "대학교", fr: "Université", category: "lieux" },
  { ko: "집", fr: "Maison", category: "lieux" },
  { ko: "식당", fr: "Restaurant", category: "lieux" },
  { ko: "병원", fr: "Hôpital", category: "lieux" },
  { ko: "공항", fr: "Aéroport", category: "lieux" },
  { ko: "역", fr: "Gare / Station", category: "lieux" },
  { ko: "은행", fr: "Banque", category: "lieux" },
  { ko: "우체국", fr: "Bureau de poste", category: "lieux" },
  { ko: "편의점", fr: "Supérette", category: "lieux" },
  { ko: "마트", fr: "Supermarché", category: "lieux" },
  { ko: "서점", fr: "Librairie", category: "lieux" },
  { ko: "카페", fr: "Café (lieu)", category: "lieux" },
  { ko: "공원", fr: "Parc", category: "lieux" },
  { ko: "도서관", fr: "Bibliothèque", category: "lieux" },
  { ko: "극장", fr: "Cinéma / Théâtre", category: "lieux" },
  { ko: "호텔", fr: "Hôtel", category: "lieux" },
  { ko: "회사", fr: "Entreprise", category: "lieux" },
  { ko: "사무실", fr: "Bureau", category: "lieux" },

  // ============ MAISON ============
  { ko: "방", fr: "Chambre / Pièce", category: "maison" },
  { ko: "문", fr: "Porte", category: "maison" },
  { ko: "창문", fr: "Fenêtre", category: "maison" },
  { ko: "부엌", fr: "Cuisine", category: "maison" },
  { ko: "화장실", fr: "Toilettes", category: "maison" },
  { ko: "거실", fr: "Salon", category: "maison" },
  { ko: "침실", fr: "Chambre à coucher", category: "maison" },
  { ko: "욕실", fr: "Salle de bain", category: "maison" },
  { ko: "계단", fr: "Escalier", category: "maison" },
  { ko: "층", fr: "Étage", category: "maison" },
  { ko: "지붕", fr: "Toit", category: "maison" },
  { ko: "벽", fr: "Mur", category: "maison" },
  { ko: "바닥", fr: "Sol", category: "maison" },

  // ============ NOURRITURE ============
  { ko: "밥", fr: "Riz / Repas", category: "nourriture" },
  { ko: "물", fr: "Eau", category: "nourriture" },
  { ko: "김치", fr: "Kimchi", category: "nourriture" },
  { ko: "라면", fr: "Ramyeon", category: "nourriture" },
  { ko: "불고기", fr: "Bulgogi", category: "nourriture" },
  { ko: "비빔밥", fr: "Bibimbap", category: "nourriture" },
  { ko: "삼겹살", fr: "Poitrine de porc grillée", category: "nourriture" },
  { ko: "치킨", fr: "Poulet frit", category: "nourriture" },
  { ko: "떡볶이", fr: "Tteokbokki", category: "nourriture" },
  { ko: "커피", fr: "Café", category: "nourriture" },
  { ko: "차", fr: "Thé", category: "nourriture" },
  { ko: "우유", fr: "Lait", category: "nourriture" },
  { ko: "맥주", fr: "Bière", category: "nourriture" },
  { ko: "소주", fr: "Soju", category: "nourriture" },
  { ko: "고기", fr: "Viande", category: "nourriture" },
  { ko: "소고기", fr: "Bœuf", category: "nourriture" },
  { ko: "돼지고기", fr: "Porc", category: "nourriture" },
  { ko: "닭고기", fr: "Poulet", category: "nourriture" },
  { ko: "생선", fr: "Poisson", category: "nourriture" },
  { ko: "야채", fr: "Légumes", category: "nourriture" },
  { ko: "과일", fr: "Fruits", category: "nourriture" },
  { ko: "사과", fr: "Pomme", category: "nourriture" },
  { ko: "바나나", fr: "Banane", category: "nourriture" },
  { ko: "딸기", fr: "Fraise", category: "nourriture" },
  { ko: "포도", fr: "Raisin", category: "nourriture" },
  { ko: "빵", fr: "Pain", category: "nourriture" },
  { ko: "계란", fr: "Œuf", category: "nourriture" },
  { ko: "국", fr: "Soupe", category: "nourriture" },
  { ko: "찌개", fr: "Ragoût", category: "nourriture" },
  { ko: "반찬", fr: "Accompagnements", category: "nourriture" },

  // ============ VÊTEMENTS ============
  { ko: "옷", fr: "Vêtements", category: "vêtements" },
  { ko: "바지", fr: "Pantalon", category: "vêtements" },
  { ko: "치마", fr: "Jupe", category: "vêtements" },
  { ko: "셔츠", fr: "Chemise", category: "vêtements" },
  { ko: "티셔츠", fr: "T-shirt", category: "vêtements" },
  { ko: "원피스", fr: "Robe", category: "vêtements" },
  { ko: "코트", fr: "Manteau", category: "vêtements" },
  { ko: "재킷", fr: "Veste", category: "vêtements" },
  { ko: "신발", fr: "Chaussures", category: "vêtements" },
  { ko: "운동화", fr: "Baskets", category: "vêtements" },
  { ko: "구두", fr: "Chaussures habillées", category: "vêtements" },
  { ko: "양말", fr: "Chaussettes", category: "vêtements" },
  { ko: "모자", fr: "Chapeau", category: "vêtements" },
  { ko: "장갑", fr: "Gants", category: "vêtements" },
  { ko: "목도리", fr: "Écharpe", category: "vêtements" },
  { ko: "가방", fr: "Sac", category: "vêtements" },
  { ko: "안경", fr: "Lunettes", category: "vêtements" },
  { ko: "시계", fr: "Montre", category: "vêtements" },

  // ============ TRANSPORT ============
  { ko: "자동차", fr: "Voiture", category: "transport" },
  { ko: "버스", fr: "Bus", category: "transport" },
  { ko: "지하철", fr: "Métro", category: "transport" },
  { ko: "기차", fr: "Train", category: "transport" },
  { ko: "비행기", fr: "Avion", category: "transport" },
  { ko: "택시", fr: "Taxi", category: "transport" },
  { ko: "배", fr: "Bateau", category: "transport" },
  { ko: "자전거", fr: "Vélo", category: "transport" },
  { ko: "오토바이", fr: "Moto", category: "transport" },
  { ko: "표", fr: "Ticket / Billet", category: "transport" },

  // ============ NATURE ============
  { ko: "날씨", fr: "Météo", category: "nature" },
  { ko: "하늘", fr: "Ciel", category: "nature" },
  { ko: "해", fr: "Soleil", category: "nature" },
  { ko: "달", fr: "Lune", category: "nature" },
  { ko: "별", fr: "Étoile", category: "nature" },
  { ko: "비", fr: "Pluie", category: "nature" },
  { ko: "눈", fr: "Neige / Yeux", category: "nature" },
  { ko: "바람", fr: "Vent", category: "nature" },
  { ko: "구름", fr: "Nuage", category: "nature" },
  { ko: "산", fr: "Montagne", category: "nature" },
  { ko: "바다", fr: "Mer", category: "nature" },
  { ko: "강", fr: "Rivière", category: "nature" },
  { ko: "호수", fr: "Lac", category: "nature" },
  { ko: "숲", fr: "Forêt", category: "nature" },
  { ko: "나무", fr: "Arbre", category: "nature" },
  { ko: "꽃", fr: "Fleur", category: "nature" },
  { ko: "풀", fr: "Herbe", category: "nature" },
  { ko: "섬", fr: "Île", category: "nature" },

  // ============ ANIMAUX ============
  { ko: "동물", fr: "Animal", category: "animaux" },
  { ko: "개", fr: "Chien", category: "animaux" },
  { ko: "고양이", fr: "Chat", category: "animaux" },
  { ko: "새", fr: "Oiseau", category: "animaux" },
  { ko: "물고기", fr: "Poisson", category: "animaux" },
  { ko: "소", fr: "Vache", category: "animaux" },
  { ko: "말", fr: "Cheval", category: "animaux" },
  { ko: "돼지", fr: "Cochon", category: "animaux" },
  { ko: "닭", fr: "Poule", category: "animaux" },
  { ko: "토끼", fr: "Lapin", category: "animaux" },
  { ko: "호랑이", fr: "Tigre", category: "animaux" },

  // ============ CORPS ============
  { ko: "몸", fr: "Corps", category: "corps" },
  { ko: "머리", fr: "Tête / Cheveux", category: "corps" },
  { ko: "얼굴", fr: "Visage", category: "corps" },
  { ko: "눈", fr: "Yeux", category: "corps" },
  { ko: "코", fr: "Nez", category: "corps" },
  { ko: "입", fr: "Bouche", category: "corps" },
  { ko: "귀", fr: "Oreille", category: "corps" },
  { ko: "손", fr: "Main", category: "corps" },
  { ko: "발", fr: "Pied", category: "corps" },
  { ko: "다리", fr: "Jambe", category: "corps" },
  { ko: "팔", fr: "Bras", category: "corps" },
  { ko: "배", fr: "Ventre", category: "corps" },
  { ko: "등", fr: "Dos", category: "corps" },
  { ko: "목", fr: "Cou", category: "corps" },
  { ko: "어깨", fr: "Épaule", category: "corps" },
  { ko: "심장", fr: "Cœur (organe)", category: "corps" },

  // ============ VERBES ============
  { ko: "먹다", fr: "Manger", category: "verbes" },
  { ko: "마시다", fr: "Boire", category: "verbes" },
  { ko: "자다", fr: "Dormir", category: "verbes" },
  { ko: "일어나다", fr: "Se lever", category: "verbes" },
  { ko: "가다", fr: "Aller", category: "verbes" },
  { ko: "오다", fr: "Venir", category: "verbes" },
  { ko: "하다", fr: "Faire", category: "verbes" },
  { ko: "보다", fr: "Voir / Regarder", category: "verbes" },
  { ko: "듣다", fr: "Écouter", category: "verbes" },
  { ko: "말하다", fr: "Parler", category: "verbes" },
  { ko: "읽다", fr: "Lire", category: "verbes" },
  { ko: "쓰다", fr: "Écrire", category: "verbes" },
  { ko: "사다", fr: "Acheter", category: "verbes" },
  { ko: "팔다", fr: "Vendre", category: "verbes" },
  { ko: "주다", fr: "Donner", category: "verbes" },
  { ko: "받다", fr: "Recevoir", category: "verbes" },
  { ko: "알다", fr: "Savoir / Connaître", category: "verbes" },
  { ko: "모르다", fr: "Ne pas savoir", category: "verbes" },
  { ko: "배우다", fr: "Apprendre", category: "verbes" },
  { ko: "가르치다", fr: "Enseigner", category: "verbes" },
  { ko: "공부하다", fr: "Étudier", category: "verbes" },
  { ko: "일하다", fr: "Travailler", category: "verbes" },
  { ko: "운동하다", fr: "Faire du sport", category: "verbes" },
  { ko: "놀다", fr: "Jouer / S'amuser", category: "verbes" },
  { ko: "쉬다", fr: "Se reposer", category: "verbes" },
  { ko: "만나다", fr: "Rencontrer", category: "verbes" },
  { ko: "기다리다", fr: "Attendre", category: "verbes" },
  { ko: "찾다", fr: "Chercher", category: "verbes" },
  { ko: "열다", fr: "Ouvrir", category: "verbes" },
  { ko: "닫다", fr: "Fermer", category: "verbes" },
  { ko: "앉다", fr: "S'asseoir", category: "verbes" },
  { ko: "서다", fr: "Se tenir debout", category: "verbes" },
  { ko: "걷다", fr: "Marcher", category: "verbes" },
  { ko: "달리다", fr: "Courir", category: "verbes" },
  { ko: "타다", fr: "Monter (véhicule)", category: "verbes" },
  { ko: "내리다", fr: "Descendre", category: "verbes" },
  { ko: "전화하다", fr: "Téléphoner", category: "verbes" },
  { ko: "요리하다", fr: "Cuisiner", category: "verbes" },
  { ko: "청소하다", fr: "Nettoyer", category: "verbes" },
  { ko: "씻다", fr: "Laver / Se laver", category: "verbes" },
  { ko: "입다", fr: "Porter (vêtement)", category: "verbes" },
  { ko: "벗다", fr: "Enlever (vêtement)", category: "verbes" },
  { ko: "생각하다", fr: "Penser", category: "verbes" },
  { ko: "느끼다", fr: "Ressentir", category: "verbes" },
  { ko: "믿다", fr: "Croire", category: "verbes" },
  { ko: "사랑하다", fr: "Aimer (amour)", category: "verbes" },
  { ko: "좋아하다", fr: "Aimer (apprécier)", category: "verbes" },
  { ko: "싫어하다", fr: "Détester", category: "verbes" },

  // ============ ADJECTIFS ============
  { ko: "좋다", fr: "Bien / Bon", category: "adjectifs" },
  { ko: "나쁘다", fr: "Mauvais", category: "adjectifs" },
  { ko: "크다", fr: "Grand", category: "adjectifs" },
  { ko: "작다", fr: "Petit", category: "adjectifs" },
  { ko: "많다", fr: "Beaucoup", category: "adjectifs" },
  { ko: "적다", fr: "Peu", category: "adjectifs" },
  { ko: "새롭다", fr: "Nouveau", category: "adjectifs" },
  { ko: "오래되다", fr: "Vieux / Ancien", category: "adjectifs" },
  { ko: "예쁘다", fr: "Joli", category: "adjectifs" },
  { ko: "아름답다", fr: "Beau", category: "adjectifs" },
  { ko: "멋있다", fr: "Cool / Stylé", category: "adjectifs" },
  { ko: "귀엽다", fr: "Mignon", category: "adjectifs" },
  { ko: "덥다", fr: "Chaud (météo)", category: "adjectifs" },
  { ko: "춥다", fr: "Froid (météo)", category: "adjectifs" },
  { ko: "따뜻하다", fr: "Tiède / Chaleureux", category: "adjectifs" },
  { ko: "시원하다", fr: "Frais / Rafraîchissant", category: "adjectifs" },
  { ko: "맛있다", fr: "Délicieux", category: "adjectifs" },
  { ko: "맛없다", fr: "Pas bon (goût)", category: "adjectifs" },
  { ko: "재미있다", fr: "Intéressant / Amusant", category: "adjectifs" },
  { ko: "재미없다", fr: "Ennuyeux", category: "adjectifs" },
  { ko: "쉽다", fr: "Facile", category: "adjectifs" },
  { ko: "어렵다", fr: "Difficile", category: "adjectifs" },
  { ko: "빠르다", fr: "Rapide", category: "adjectifs" },
  { ko: "느리다", fr: "Lent", category: "adjectifs" },
  { ko: "가깝다", fr: "Proche", category: "adjectifs" },
  { ko: "멀다", fr: "Loin", category: "adjectifs" },
  { ko: "비싸다", fr: "Cher (prix)", category: "adjectifs" },
  { ko: "싸다", fr: "Pas cher", category: "adjectifs" },
  { ko: "길다", fr: "Long", category: "adjectifs" },
  { ko: "짧다", fr: "Court", category: "adjectifs" },
  { ko: "같다", fr: "Identique / Pareil", category: "adjectifs" },
  { ko: "다르다", fr: "Différent", category: "adjectifs" },
  { ko: "중요하다", fr: "Important", category: "adjectifs" },
  { ko: "필요하다", fr: "Nécessaire", category: "adjectifs" },

  // ============ ÉMOTIONS ============
  { ko: "기쁘다", fr: "Content / Joyeux", category: "émotions" },
  { ko: "슬프다", fr: "Triste", category: "émotions" },
  { ko: "화나다", fr: "En colère", category: "émotions" },
  { ko: "무섭다", fr: "Effrayant / Avoir peur", category: "émotions" },
  { ko: "걱정하다", fr: "S'inquiéter", category: "émotions" },
  { ko: "피곤하다", fr: "Fatigué", category: "émotions" },
  { ko: "배고프다", fr: "Avoir faim", category: "émotions" },
  { ko: "목마르다", fr: "Avoir soif", category: "émotions" },
  { ko: "행복하다", fr: "Heureux", category: "émotions" },
  { ko: "외롭다", fr: "Seul / Solitaire", category: "émotions" },
  { ko: "부끄럽다", fr: "Gêné / Honteux", category: "émotions" },
  { ko: "놀라다", fr: "Être surpris", category: "émotions" },
  { ko: "사랑", fr: "Amour", category: "émotions" },
  { ko: "행복", fr: "Bonheur", category: "émotions" },
  { ko: "슬픔", fr: "Tristesse", category: "émotions" },
  { ko: "기쁨", fr: "Joie", category: "émotions" },

  // ============ OBJETS & TECHNOLOGIE ============
  { ko: "책", fr: "Livre", category: "objets" },
  { ko: "연필", fr: "Crayon", category: "objets" },
  { ko: "펜", fr: "Stylo", category: "objets" },
  { ko: "공책", fr: "Cahier", category: "objets" },
  { ko: "컴퓨터", fr: "Ordinateur", category: "objets" },
  { ko: "핸드폰", fr: "Téléphone portable", category: "objets" },
  { ko: "텔레비전", fr: "Télévision", category: "objets" },
  { ko: "카메라", fr: "Appareil photo", category: "objets" },
  { ko: "열쇠", fr: "Clé", category: "objets" },
  { ko: "우산", fr: "Parapluie", category: "objets" },
  { ko: "지갑", fr: "Portefeuille", category: "objets" },
  { ko: "돈", fr: "Argent", category: "objets" },
  { ko: "의자", fr: "Chaise", category: "objets" },
  { ko: "책상", fr: "Bureau (meuble)", category: "objets" },
  { ko: "침대", fr: "Lit", category: "objets" },
  { ko: "냉장고", fr: "Réfrigérateur", category: "objets" },
  { ko: "에어컨", fr: "Climatisation", category: "objets" },

  // ============ LOISIRS & ACTIVITÉS ============
  { ko: "영화", fr: "Film", category: "loisirs" },
  { ko: "음악", fr: "Musique", category: "loisirs" },
  { ko: "노래", fr: "Chanson", category: "loisirs" },
  { ko: "춤", fr: "Danse", category: "loisirs" },
  { ko: "게임", fr: "Jeu", category: "loisirs" },
  { ko: "여행", fr: "Voyage", category: "loisirs" },
  { ko: "운동", fr: "Sport / Exercice", category: "loisirs" },
  { ko: "축구", fr: "Football", category: "loisirs" },
  { ko: "야구", fr: "Baseball", category: "loisirs" },
  { ko: "농구", fr: "Basketball", category: "loisirs" },
  { ko: "수영", fr: "Natation", category: "loisirs" },
  { ko: "사진", fr: "Photo", category: "loisirs" },
  { ko: "그림", fr: "Dessin / Peinture", category: "loisirs" },

  // ============ TRAVAIL & ÉTUDES ============
  { ko: "일", fr: "Travail", category: "travail" },
  { ko: "직업", fr: "Profession", category: "travail" },
  { ko: "회의", fr: "Réunion", category: "travail" },
  { ko: "프로젝트", fr: "Projet", category: "travail" },
  { ko: "선생님", fr: "Professeur", category: "travail" },
  { ko: "학생", fr: "Étudiant", category: "travail" },
  { ko: "의사", fr: "Médecin", category: "travail" },
  { ko: "간호사", fr: "Infirmier(ère)", category: "travail" },
  { ko: "경찰", fr: "Policier", category: "travail" },
  { ko: "가수", fr: "Chanteur", category: "travail" },
  { ko: "배우", fr: "Acteur", category: "travail" },

  // ============ PERSONNES ============
  { ko: "사람", fr: "Personne", category: "personnes" },
  { ko: "친구", fr: "Ami", category: "personnes" },
  { ko: "남자", fr: "Homme", category: "personnes" },
  { ko: "여자", fr: "Femme", category: "personnes" },
  { ko: "아이", fr: "Enfant", category: "personnes" },
  { ko: "어른", fr: "Adulte", category: "personnes" },
  { ko: "손님", fr: "Client / Invité", category: "personnes" },
  { ko: "이름", fr: "Nom / Prénom", category: "personnes" },
  { ko: "나이", fr: "Âge", category: "personnes" },

  // ============ COULEURS ============
  { ko: "색", fr: "Couleur", category: "couleurs" },
  { ko: "빨간색", fr: "Rouge", category: "couleurs" },
  { ko: "파란색", fr: "Bleu", category: "couleurs" },
  { ko: "노란색", fr: "Jaune", category: "couleurs" },
  { ko: "초록색", fr: "Vert", category: "couleurs" },
  { ko: "주황색", fr: "Orange", category: "couleurs" },
  { ko: "보라색", fr: "Violet", category: "couleurs" },
  { ko: "분홍색", fr: "Rose", category: "couleurs" },
  { ko: "하얀색", fr: "Blanc", category: "couleurs" },
  { ko: "검은색", fr: "Noir", category: "couleurs" },
  { ko: "회색", fr: "Gris", category: "couleurs" },
  { ko: "갈색", fr: "Marron", category: "couleurs" },

  // ============ SAISONS & MÉTÉO ============
  { ko: "봄", fr: "Printemps", category: "saisons" },
  { ko: "여름", fr: "Été", category: "saisons" },
  { ko: "가을", fr: "Automne", category: "saisons" },
  { ko: "겨울", fr: "Hiver", category: "saisons" },
  { ko: "맑다", fr: "Clair / Ensoleillé", category: "météo" },
  { ko: "흐리다", fr: "Nuageux", category: "météo" },
  { ko: "비가 오다", fr: "Pleuvoir", category: "météo" },
  { ko: "눈이 오다", fr: "Neiger", category: "météo" },
  { ko: "바람이 불다", fr: "Le vent souffle", category: "météo" },
  { ko: "태풍", fr: "Typhon", category: "météo" },
  { ko: "우산", fr: "Parapluie", category: "météo" },

  // ============ DIRECTIONS ============
  { ko: "위", fr: "Haut / Au-dessus", category: "directions" },
  { ko: "아래", fr: "Bas / En-dessous", category: "directions" },
  { ko: "앞", fr: "Devant", category: "directions" },
  { ko: "뒤", fr: "Derrière", category: "directions" },
  { ko: "옆", fr: "À côté", category: "directions" },
  { ko: "왼쪽", fr: "Gauche", category: "directions" },
  { ko: "오른쪽", fr: "Droite", category: "directions" },
  { ko: "안", fr: "Intérieur", category: "directions" },
  { ko: "밖", fr: "Extérieur", category: "directions" },
  { ko: "사이", fr: "Entre", category: "directions" },
  { ko: "가운데", fr: "Milieu / Centre", category: "directions" },
  { ko: "북쪽", fr: "Nord", category: "directions" },
  { ko: "남쪽", fr: "Sud", category: "directions" },
  { ko: "동쪽", fr: "Est", category: "directions" },
  { ko: "서쪽", fr: "Ouest", category: "directions" },

  // ============ VERBES COURANTS SUPPLÉMENTAIRES ============
  { ko: "춤추다", fr: "Danser", category: "verbes" },
  { ko: "노래하다", fr: "Chanter", category: "verbes" },
  { ko: "웃다", fr: "Rire / Sourire", category: "verbes" },
  { ko: "울다", fr: "Pleurer", category: "verbes" },
  { ko: "던지다", fr: "Lancer", category: "verbes" },
  { ko: "잡다", fr: "Attraper", category: "verbes" },
  { ko: "밀다", fr: "Pousser", category: "verbes" },
  { ko: "당기다", fr: "Tirer", category: "verbes" },
  { ko: "들다", fr: "Porter / Soulever", category: "verbes" },
  { ko: "놓다", fr: "Poser", category: "verbes" },
  { ko: "켜다", fr: "Allumer", category: "verbes" },
  { ko: "끄다", fr: "Éteindre", category: "verbes" },
  { ko: "시작하다", fr: "Commencer", category: "verbes" },
  { ko: "끝나다", fr: "Finir / Se terminer", category: "verbes" },
  { ko: "도착하다", fr: "Arriver", category: "verbes" },
  { ko: "떠나다", fr: "Partir", category: "verbes" },
  { ko: "돌아오다", fr: "Revenir", category: "verbes" },
  { ko: "돌아가다", fr: "Retourner", category: "verbes" },
  { ko: "올라가다", fr: "Monter", category: "verbes" },
  { ko: "내려가다", fr: "Descendre", category: "verbes" },
  { ko: "들어가다", fr: "Entrer", category: "verbes" },
  { ko: "나가다", fr: "Sortir", category: "verbes" },
  { ko: "바꾸다", fr: "Changer / Échanger", category: "verbes" },
  { ko: "고치다", fr: "Réparer", category: "verbes" },
  { ko: "깨다", fr: "Casser / Se réveiller", category: "verbes" },
  { ko: "자르다", fr: "Couper", category: "verbes" },
  { ko: "섞다", fr: "Mélanger", category: "verbes" },
  { ko: "붓다", fr: "Verser", category: "verbes" },
  { ko: "굽다", fr: "Griller / Cuire au four", category: "verbes" },
  { ko: "삶다", fr: "Bouillir", category: "verbes" },
  { ko: "볶다", fr: "Faire sauter", category: "verbes" },
  { ko: "튀기다", fr: "Frire", category: "verbes" },

  // ============ ADJECTIFS SUPPLÉMENTAIRES ============
  { ko: "넓다", fr: "Large / Spacieux", category: "adjectifs" },
  { ko: "좁다", fr: "Étroit", category: "adjectifs" },
  { ko: "높다", fr: "Haut / Élevé", category: "adjectifs" },
  { ko: "낮다", fr: "Bas", category: "adjectifs" },
  { ko: "무겁다", fr: "Lourd", category: "adjectifs" },
  { ko: "가볍다", fr: "Léger", category: "adjectifs" },
  { ko: "두껍다", fr: "Épais", category: "adjectifs" },
  { ko: "얇다", fr: "Fin / Mince", category: "adjectifs" },
  { ko: "딱딱하다", fr: "Dur", category: "adjectifs" },
  { ko: "부드럽다", fr: "Doux / Mou", category: "adjectifs" },
  { ko: "깨끗하다", fr: "Propre", category: "adjectifs" },
  { ko: "더럽다", fr: "Sale", category: "adjectifs" },
  { ko: "시끄럽다", fr: "Bruyant", category: "adjectifs" },
  { ko: "조용하다", fr: "Calme / Silencieux", category: "adjectifs" },
  { ko: "밝다", fr: "Lumineux", category: "adjectifs" },
  { ko: "어둡다", fr: "Sombre", category: "adjectifs" },
  { ko: "건강하다", fr: "En bonne santé", category: "adjectifs" },
  { ko: "아프다", fr: "Malade / Avoir mal", category: "adjectifs" },
  { ko: "바쁘다", fr: "Occupé", category: "adjectifs" },
  { ko: "한가하다", fr: "Libre / Disponible", category: "adjectifs" },
  { ko: "유명하다", fr: "Célèbre", category: "adjectifs" },
  { ko: "특별하다", fr: "Spécial", category: "adjectifs" },
  { ko: "보통", fr: "Normal / Ordinaire", category: "adjectifs" },

  // ============ EXPRESSIONS COURANTES ============
  { ko: "물론", fr: "Bien sûr", category: "expressions" },
  { ko: "아직", fr: "Encore / Pas encore", category: "expressions" },
  { ko: "벌써", fr: "Déjà", category: "expressions" },
  { ko: "다시", fr: "De nouveau", category: "expressions" },
  { ko: "함께", fr: "Ensemble", category: "expressions" },
  { ko: "혼자", fr: "Seul", category: "expressions" },
  { ko: "조금", fr: "Un peu", category: "expressions" },
  { ko: "많이", fr: "Beaucoup", category: "expressions" },
  { ko: "전혀", fr: "Pas du tout", category: "expressions" },
  { ko: "거의", fr: "Presque", category: "expressions" },
  { ko: "약", fr: "Environ", category: "expressions" },
  { ko: "대부분", fr: "La plupart", category: "expressions" },
  { ko: "모두", fr: "Tous / Tout", category: "expressions" },
  { ko: "아무도", fr: "Personne", category: "expressions" },
  { ko: "아무것도", fr: "Rien", category: "expressions" },
  { ko: "그래서", fr: "Donc / C'est pourquoi", category: "expressions" },
  { ko: "그런데", fr: "Mais / Cependant", category: "expressions" },
  { ko: "그리고", fr: "Et", category: "expressions" },
  { ko: "또는", fr: "Ou", category: "expressions" },
  { ko: "만약", fr: "Si (conditionnel)", category: "expressions" },
  { ko: "왜냐하면", fr: "Parce que", category: "expressions" },

  // ============ NOURRITURE SUPPLÉMENTAIRE ============
  { ko: "국수", fr: "Nouilles", category: "nourriture" },
  { ko: "만두", fr: "Raviolis coréens", category: "nourriture" },
  { ko: "김밥", fr: "Kimbap (sushi coréen)", category: "nourriture" },
  { ko: "잡채", fr: "Japchae (nouilles aux légumes)", category: "nourriture" },
  { ko: "순두부", fr: "Tofu soyeux", category: "nourriture" },
  { ko: "된장", fr: "Pâte de soja fermenté", category: "nourriture" },
  { ko: "고추장", fr: "Pâte de piment", category: "nourriture" },
  { ko: "간장", fr: "Sauce soja", category: "nourriture" },
  { ko: "참기름", fr: "Huile de sésame", category: "nourriture" },
  { ko: "마늘", fr: "Ail", category: "nourriture" },
  { ko: "양파", fr: "Oignon", category: "nourriture" },
  { ko: "당근", fr: "Carotte", category: "nourriture" },
  { ko: "감자", fr: "Pomme de terre", category: "nourriture" },
  { ko: "고구마", fr: "Patate douce", category: "nourriture" },
  { ko: "오이", fr: "Concombre", category: "nourriture" },
  { ko: "배추", fr: "Chou chinois", category: "nourriture" },
  { ko: "시금치", fr: "Épinards", category: "nourriture" },
  { ko: "버섯", fr: "Champignon", category: "nourriture" },
  { ko: "콩", fr: "Haricot / Soja", category: "nourriture" },
  { ko: "쌀", fr: "Riz (non cuit)", category: "nourriture" },

  // ============ ÉCOLE & ÉDUCATION ============
  { ko: "수업", fr: "Cours", category: "école" },
  { ko: "숙제", fr: "Devoirs", category: "école" },
  { ko: "시험", fr: "Examen", category: "école" },
  { ko: "문제", fr: "Problème / Question", category: "école" },
  { ko: "답", fr: "Réponse", category: "école" },
  { ko: "질문", fr: "Question", category: "école" },
  { ko: "설명", fr: "Explication", category: "école" },
  { ko: "연습", fr: "Exercice / Pratique", category: "école" },
  { ko: "복습", fr: "Révision", category: "école" },
  { ko: "예습", fr: "Préparation (avant cours)", category: "école" },
  { ko: "성적", fr: "Notes / Résultats", category: "école" },
  { ko: "졸업", fr: "Diplôme / Remise des diplômes", category: "école" },

  // ============ TECHNOLOGIE ============
  { ko: "인터넷", fr: "Internet", category: "technologie" },
  { ko: "컴퓨터", fr: "Ordinateur", category: "technologie" },
  { ko: "노트북", fr: "Ordinateur portable", category: "technologie" },
  { ko: "스마트폰", fr: "Smartphone", category: "technologie" },
  { ko: "이메일", fr: "E-mail", category: "technologie" },
  { ko: "비밀번호", fr: "Mot de passe", category: "technologie" },
  { ko: "검색", fr: "Recherche", category: "technologie" },
  { ko: "다운로드", fr: "Téléchargement", category: "technologie" },
  { ko: "업로드", fr: "Téléversement", category: "technologie" },
  { ko: "앱", fr: "Application", category: "technologie" },
  { ko: "웹사이트", fr: "Site web", category: "technologie" },

  // ============ SANTÉ ============
  { ko: "건강", fr: "Santé", category: "santé" },
  { ko: "약", fr: "Médicament", category: "santé" },
  { ko: "감기", fr: "Rhume", category: "santé" },
  { ko: "열", fr: "Fièvre", category: "santé" },
  { ko: "두통", fr: "Mal de tête", category: "santé" },
  { ko: "배탈", fr: "Mal de ventre", category: "santé" },
  { ko: "기침", fr: "Toux", category: "santé" },
  { ko: "콧물", fr: "Nez qui coule", category: "santé" },
  { ko: "주사", fr: "Piqûre / Injection", category: "santé" },
  { ko: "치료", fr: "Traitement", category: "santé" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions(
  direction: QuizDirection,
  count: number
): Question[] {
  const shuffled = shuffle(VOCABULARY);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((item) => {
    const question = direction === "ko-fr" ? item.ko : item.fr;
    const correct = direction === "ko-fr" ? item.fr : item.ko;

    // Get 3 random wrong answers
    const wrongAnswers = shuffle(
      VOCABULARY.filter((v) =>
        direction === "ko-fr" ? v.fr !== item.fr : v.ko !== item.ko
      )
    )
      .slice(0, 3)
      .map((v) => (direction === "ko-fr" ? v.fr : v.ko));

    return {
      question,
      correct,
      choices: shuffle([correct, ...wrongAnswers]),
      direction,
    };
  });
}

export default function QuizClient() {
  const [quizDirection, setQuizDirection] = useState<QuizDirection>("ko-fr");
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{
    message: string;
    correct: boolean;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const {
    state: stats,
    setState: setStats,
    hydrated,
  } = useLocalStorageState<{ total: number; correct: number }>(
    "krdict:quiz-stats",
    { total: 0, correct: 0 }
  );

  const startQuiz = useCallback(() => {
    const qs = generateQuestions(quizDirection, questionCount);
    setQuestions(qs);
    setIdx(0);
    setScore(0);
    setFeedback(null);
    setIsRunning(true);
  }, [quizDirection, questionCount]);

  function answer(choice: string) {
    const q = questions[idx];
    if (!q || feedback) return;

    const isCorrect = choice === q.correct;

    if (isCorrect) {
      setScore((s) => s + 1);
      setFeedback({ message: "✅ Correct !", correct: true });
      setStats({ total: stats.total + 1, correct: stats.correct + 1 });
    } else {
      setFeedback({
        message: `❌ La bonne réponse était : ${q.correct}`,
        correct: false,
      });
      setStats({ total: stats.total + 1, correct: stats.correct });
    }

    setTimeout(() => {
      setFeedback(null);
      if (idx + 1 >= questions.length) {
        setIsRunning(false);
      } else {
        setIdx((i) => i + 1);
      }
    }, 1500);
  }

  const current = questions[idx];
  const finished = questions.length > 0 && idx >= questions.length;

  // Quiz setup screen
  if (!isRunning && !finished) {
    return (
      <div className="space-y-6">
        {/* Stats */}
        {hydrated && stats.total > 0 && (
          <div className="section-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-[var(--text-secondary)]">
                Ton score global :
                <span className="font-bold text-[var(--accent)] ml-2">
                  {stats.correct} / {stats.total}
                </span>
                <span className="text-[var(--text-muted)] ml-2">
                  ({Math.round((stats.correct / stats.total) * 100)}%)
                </span>
              </p>
              <button
                onClick={() => {
                  if (
                    confirm(
                      "Es-tu sûr de vouloir réinitialiser ton score ? Cette action est irréversible."
                    )
                  ) {
                    setStats({ total: 0, correct: 0 });
                  }
                }}
                className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center gap-1"
                title="Réinitialiser le score"
              >
                🗑️ Réinitialiser
              </button>
            </div>
          </div>
        )}

        <div className="section-card p-6 space-y-6">
          <h2 className="font-semibold text-lg text-center">Configuration</h2>

          {/* Direction */}
          <div className="space-y-2">
            <label className="text-sm text-[var(--text-muted)]">
              Direction :
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setQuizDirection("ko-fr")}
                className={`flex-1 direction-btn ${
                  quizDirection === "ko-fr" ? "active" : "inactive"
                }`}
              >
                🇰🇷 KO → FR 🇫🇷
              </button>
              <button
                onClick={() => setQuizDirection("fr-ko")}
                className={`flex-1 direction-btn ${
                  quizDirection === "fr-ko" ? "active" : "inactive"
                }`}
              >
                🇫🇷 FR → KO 🇰🇷
              </button>
            </div>
          </div>

          {/* Question count */}
          <div className="space-y-2">
            <label className="text-sm text-[var(--text-muted)]">
              Nombre de questions : {questionCount}
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full accent-[var(--primary-start)]"
            />
            <div className="flex justify-between text-xs text-[var(--text-muted)]">
              <span>5</span>
              <span>50</span>
            </div>
          </div>

          {/* Start button */}
          <button onClick={startQuiz} className="btn-primary w-full">
            Commencer le Quiz
          </button>
        </div>

        {/* Categories info */}
        <div className="section-card p-4">
          <p className="text-sm text-[var(--text-muted)] text-center">
            📚 {VOCABULARY.length} mots disponibles : salutations, famille,
            nombres, jours, verbes, adjectifs...
          </p>
        </div>
      </div>
    );
  }

  // Quiz finished screen
  if (finished || (!isRunning && questions.length > 0)) {
    const percentage = Math.round((score / questions.length) * 100);
    const emoji =
      percentage === 100
        ? "🎉"
        : percentage >= 70
        ? "👏"
        : percentage >= 50
        ? "👍"
        : "📚";

    return (
      <div className="section-card p-8 text-center space-y-6 animate-fade-in">
        <p className="text-6xl">{emoji}</p>
        <h2 className="text-3xl font-bold gradient-text">Quiz Terminé !</h2>
        <p className="text-xl">
          Score : <span className="font-bold">{score}</span> /{" "}
          {questions.length}
          <span className="text-[var(--text-muted)] ml-2">({percentage}%)</span>
        </p>
        <p className="text-[var(--text-secondary)]">
          {percentage === 100
            ? "Parfait ! Tu maîtrises ce vocabulaire !"
            : percentage >= 70
            ? "Excellent travail, continue comme ça !"
            : percentage >= 50
            ? "Pas mal ! Entraîne-toi encore."
            : "Continue à réviser, tu vas progresser !"}
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={startQuiz} className="btn-primary">
            Rejouer
          </button>
          <button
            onClick={() => {
              setQuestions([]);
              setIsRunning(false);
            }}
            className="btn-secondary"
          >
            Changer les options
          </button>
        </div>
      </div>
    );
  }

  // Quiz in progress
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Progress */}
      <div className="section-card p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span
            className={`badge ${
              current.direction === "ko-fr" ? "badge-ko" : "badge-fr"
            }`}
          >
            {current.direction === "ko-fr" ? "KO → FR" : "FR → KO"}
          </span>
          <span className="text-[var(--text-muted)]">
            Question {idx + 1} / {questions.length}
          </span>
          <span className="font-bold text-[var(--accent)]">Score: {score}</span>
        </div>
        <div className="h-2 bg-[var(--border-subtle)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] transition-all"
            style={{ width: `${((idx + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="section-card p-6 text-center">
        <p className="text-3xl font-bold gradient-text">{current.question}</p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`section-card p-4 text-center ${
            feedback.correct
              ? "bg-green-100 dark:bg-green-900/20 border-green-400"
              : "bg-red-100 dark:bg-red-900/20 border-red-400"
          } animate-fade-in`}
        >
          <p
            className={
              feedback.correct
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }
          >
            {feedback.message}
          </p>
        </div>
      )}

      {/* Choices */}
      <div className="space-y-3">
        {current.choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => answer(choice)}
            disabled={!!feedback}
            className={`quiz-choice ${
              feedback ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            <span className="text-[var(--text-muted)] mr-3">
              {String.fromCharCode(65 + i)}.
            </span>
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}
