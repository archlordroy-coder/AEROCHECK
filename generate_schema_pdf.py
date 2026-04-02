#!/usr/bin/env python3
"""
Générateur de PDF pour le MCD et MLD de AEROCHECK
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_CENTER, TA_LEFT

# Configuration
title = "AEROCHECK - Modélisation de la Base de Données"
subtitle_mcd = "Modèle Conceptuel de Données (MCD)"
subtitle_mld = "Modèle Logique de Données (MLD)"

# Entités et attributs
entities = {
    "User": {
        "attributes": [
            ("id", "String", "PK"),
            ("email", "String", "Unique"),
            ("password", "String", ""),
            ("role", "String", "Enum"),
            ("firstName", "String", ""),
            ("lastName", "String", ""),
            ("phone", "String", "Nullable"),
            ("paysId", "String", "FK -> Pays"),
            ("aeroportId", "String", "FK -> Aeroport"),
            ("matricule", "String", "Unique"),
            ("dateNomination", "DateTime", "Nullable"),
            ("isActive", "Boolean", "Default: true"),
            ("createdAt", "DateTime", "Auto"),
            ("updatedAt", "DateTime", "Auto"),
        ],
        "relations": [
            "1-N: Agent (un User peut avoir un profil Agent)",
            "N-M: Validation (un User peut valider des documents)",
            "1-N: Notification (un User reçoit des notifications)",
        ]
    },
    "Agent": {
        "attributes": [
            ("id", "String", "PK"),
            ("userId", "String", "FK -> User, Unique"),
            ("matricule", "String", "Unique"),
            ("dateNaissance", "DateTime", ""),
            ("lieuNaissance", "String", ""),
            ("nationaliteId", "String", "FK -> Nationalite"),
            ("adresse", "String", ""),
            ("fonction", "String", ""),
            ("employeurId", "String", "FK -> Employeur"),
            ("paysId", "String", "FK -> Pays"),
            ("aeroportId", "String", "FK -> Aeroport"),
            ("zoneAcces", "String", "JSON Array"),
            ("status", "String", "Enum"),
            ("createdAt", "DateTime", "Auto"),
            ("updatedAt", "DateTime", "Auto"),
        ],
        "relations": [
            "1-N: Document (un Agent a plusieurs documents)",
            "1-N: License (un Agent peut avoir plusieurs licences)",
            "N-1: User (profil lié à un compte User)",
        ]
    },
    "Document": {
        "attributes": [
            ("id", "String", "PK"),
            ("agentId", "String", "FK -> Agent"),
            ("type", "String", "Enum"),
            ("fileName", "String", ""),
            ("filePath", "String", ""),
            ("status", "String", "Enum: EN_ATTENTE/VALIDE/REJETE"),
            ("expiresAt", "DateTime", "Nullable"),
            ("archived", "Boolean", "Default: false"),
            ("archivedAt", "DateTime", "Nullable"),
            ("createdAt", "DateTime", "Auto"),
            ("updatedAt", "DateTime", "Auto"),
        ],
        "relations": [
            "N-1: Agent (appartient à un agent)",
            "1-N: Validation (peut avoir plusieurs validations)",
        ]
    },
    "Validation": {
        "attributes": [
            ("id", "String", "PK"),
            ("documentId", "String", "FK -> Document"),
            ("validatorId", "String", "FK -> User"),
            ("status", "String", "Enum"),
            ("niveau", "String", "Enum: QIP/DLAA"),
            ("comment", "String", "Nullable"),
            ("createdAt", "DateTime", "Auto"),
        ],
        "relations": [
            "N-1: Document (validation d'un document)",
            "N-1: User (validation faite par un utilisateur)",
        ]
    },
    "License": {
        "attributes": [
            ("id", "String", "PK"),
            ("agentId", "String", "FK -> Agent"),
            ("numero", "String", "Unique"),
            ("dateEmission", "DateTime", ""),
            ("dateExpiration", "DateTime", ""),
            ("status", "String", "Enum: ACTIVE/EXPIREE/REVOQUEE"),
            ("qrCode", "String", "Nullable"),
            ("createdAt", "DateTime", "Auto"),
            ("updatedAt", "DateTime", "Auto"),
        ],
        "relations": [
            "N-1: Agent (licence appartient à un agent)",
        ]
    },
    "Notification": {
        "attributes": [
            ("id", "String", "PK"),
            ("userId", "String", "FK -> User"),
            ("type", "String", "Enum"),
            ("title", "String", ""),
            ("message", "String", ""),
            ("read", "Boolean", "Default: false"),
            ("data", "String", "JSON, Nullable"),
            ("createdAt", "DateTime", "Auto"),
        ],
        "relations": [
            "N-1: User (notification pour un utilisateur)",
        ]
    },
    "Nationalite": {
        "attributes": [
            ("id", "String", "PK"),
            ("code", "String", "Unique (ISO)"),
            ("nom", "String", "Unique"),
            ("createdAt", "DateTime", "Auto"),
            ("updatedAt", "DateTime", "Auto"),
        ],
        "relations": [
            "1-N: Agent (plusieurs agents peuvent avoir cette nationalité)",
        ]
    },
    "Employeur": {
        "attributes": [
            ("id", "String", "PK"),
            ("nom", "String", "Unique"),
            ("createdAt", "DateTime", "Auto"),
            ("updatedAt", "DateTime", "Auto"),
        ],
        "relations": [
            "1-N: Agent (plusieurs agents travaillent pour cet employeur)",
        ]
    },
    "Pays": {
        "attributes": [
            ("id", "String", "PK"),
            ("code", "String", "Unique (ISO 3166-1)"),
            ("nom", "String", "Unique"),
            ("nomFr", "String", "Nom en français"),
            ("createdAt", "DateTime", "Auto"),
            ("updatedAt", "DateTime", "Auto"),
        ],
        "relations": [
            "1-N: Aeroport (un pays a plusieurs aéroports)",
            "1-N: Agent (plusieurs agents dans ce pays)",
            "1-N: User (plusieurs utilisateurs dans ce pays)",
        ]
    },
    "Aeroport": {
        "attributes": [
            ("id", "String", "PK"),
            ("code", "String", "Unique (IATA)"),
            ("nom", "String", ""),
            ("ville", "String", ""),
            ("paysId", "String", "FK -> Pays"),
            ("createdAt", "DateTime", "Auto"),
            ("updatedAt", "DateTime", "Auto"),
        ],
        "relations": [
            "N-1: Pays (appartient à un pays)",
            "1-N: Agent (plusieurs agents dans cet aéroport)",
            "1-N: User (plusieurs utilisateurs dans cet aéroport)",
        ]
    },
    "DocumentTypeConfig": {
        "attributes": [
            ("id", "String", "PK"),
            ("type", "String", "Unique"),
            ("validityDuration", "Integer", "Jours"),
            ("isRequired", "Boolean", "Default: true"),
            ("createdAt", "DateTime", "Auto"),
            ("updatedAt", "DateTime", "Auto"),
        ],
        "relations": []
    }
}

# Relations MCD (Conceptuel)
mcd_relations = [
    ("User", "1,1", "Agent", "0,1", "Possède un profil"),
    ("User", "1,N", "Validation", "Validate", "Valide des documents"),
    ("User", "1,N", "Notification", "0,N", "Reçoit des notifications"),
    ("Agent", "1,1", "User", "1,1", "Est associé à un compte"),
    ("Agent", "1,N", "Document", "0,N", "Soumet des documents"),
    ("Agent", "1,N", "License", "0,N", "Obtient des licences"),
    ("Agent", "N,1", "Nationalite", "1,1", "A une nationalité"),
    ("Agent", "N,1", "Employeur", "1,1", "Travaille pour"),
    ("Agent", "N,1", "Pays", "1,1", "Est basé dans"),
    ("Agent", "N,1", "Aeroport", "1,1", "Opère à l'aéroport"),
    ("Document", "N,1", "Agent", "1,1", "Appartient à"),
    ("Document", "1,N", "Validation", "0,N", "Subit des validations"),
    ("Validation", "N,1", "Document", "1,1", "Concerne un document"),
    ("Validation", "N,1", "User", "1,1", "Faite par"),
    ("License", "N,1", "Agent", "1,1", "Délivrée à"),
    ("Notification", "N,1", "User", "1,1", "Destinée à"),
    ("Nationalite", "1,N", "Agent", "0,N", "Détenue par"),
    ("Employeur", "1,N", "Agent", "0,N", "Emploie"),
    ("Pays", "1,N", "Agent", "0,N", "Accueille"),
    ("Pays", "1,N", "User", "0,N", "Assigne"),
    ("Pays", "1,N", "Aeroport", "1,N", "Contient"),
    ("Aeroport", "N,1", "Pays", "1,1", "Situé dans"),
    ("Aeroport", "1,N", "Agent", "0,N", "Accueille"),
    ("Aeroport", "1,N", "User", "0,N", "Assigne"),
]

def create_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a56db'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=colors.HexColor('#1a56db'),
        spaceAfter=20,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    )
    
    entity_style = ParagraphStyle(
        'EntityTitle',
        parent=styles['Heading3'],
        fontSize=14,
        textColor=colors.HexColor('#1a56db'),
        spaceAfter=10,
        spaceBefore=15,
        fontName='Helvetica-Bold'
    )
    
    text_style = styles["Normal"]
    text_style.fontSize = 10
    
    elements = []
    
    # Title
    elements.append(Paragraph(title, title_style))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("Système de Gestion des Licences Aéroportuaires", text_style))
    elements.append(Spacer(1, 30))
    
    # MCD Section
    elements.append(Paragraph(subtitle_mcd, subtitle_style))
    elements.append(Spacer(1, 10))
    
    elements.append(Paragraph("<b>Modèle Conceptuel de Données (Entité-Association)</b>", text_style))
    elements.append(Spacer(1, 10))
    
    # Description MCD
    mcd_desc = """
    Le MCD représente la vue conceptuelle des données indépendante de toute implémentation technique.
    Il identifie les entités, leurs attributs et les associations entre elles.
    """
    elements.append(Paragraph(mcd_desc, text_style))
    elements.append(Spacer(1, 15))
    
    # Entités table
    elements.append(Paragraph("<b>Entités du MCD:</b>", text_style))
    elements.append(Spacer(1, 5))
    
    entity_data = [["Entité", "Description", "Cardinalités principales"]]
    entity_desc = {
        "User": "Utilisateurs du système (Admin, QIP, DLAA, Agent)",
        "Agent": "Profil d'agent demandeur de licence",
        "Document": "Documents soumis pour validation",
        "Validation": "Validation de documents par QIP/DLAA",
        "License": "Licence d'accès aéroportuaire délivrée",
        "Notification": "Notifications envoyées aux utilisateurs",
        "Nationalite": "Nationalités (données de référence)",
        "Employeur": "Employeurs des agents (données de référence)",
        "Pays": "Pays africains (données de référence)",
        "Aeroport": "Aéroports (données de référence)",
    }
    
    for ent, desc in entity_desc.items():
        entity_data.append([ent, desc, ""])
    
    entity_table = Table(entity_data, colWidths=[4*cm, 9*cm, 4*cm])
    entity_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a56db')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
    ]))
    elements.append(entity_table)
    elements.append(Spacer(1, 20))
    
    # Associations
    elements.append(Paragraph("<b>Associations du MCD:</b>", text_style))
    elements.append(Spacer(1, 5))
    
    assoc_data = [["Entité 1", "Card.", "Entité 2", "Card.", "Description"]]
    for rel in mcd_relations[:20]:  # Limit to 20 for first page
        assoc_data.append([rel[0], rel[1], rel[2], rel[3], rel[4]])
    
    assoc_table = Table(assoc_data, colWidths=[3*cm, 2*cm, 3*cm, 2*cm, 7*cm])
    assoc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a56db')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('ALIGN', (3, 0), (3, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
    ]))
    elements.append(assoc_table)
    elements.append(PageBreak())
    
    # MLD Section
    elements.append(Paragraph(subtitle_mld, subtitle_style))
    elements.append(Spacer(1, 10))
    
    mld_desc = """
    Le MLD représente la vue logique des données adaptée à une base de données relationnelle.
    Il traduit le MCD en tables SQL avec les clés primaires (PK) et étrangères (FK).
    """
    elements.append(Paragraph(mld_desc, text_style))
    elements.append(Spacer(1, 15))
    
    # Detailed entities
    for entity_name, entity_info in entities.items():
        elements.append(Paragraph(f"<b>Table: {entity_name}</b>", entity_style))
        
        # Attributes table
        attr_data = [["Attribut", "Type", "Contrainte"]]
        for attr in entity_info["attributes"]:
            attr_data.append([attr[0], attr[1], attr[2]])
        
        attr_table = Table(attr_data, colWidths=[4*cm, 3*cm, 10*cm])
        attr_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4a5568')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f7fafc')]),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(attr_table)
        
        # Relations
        if entity_info["relations"]:
            elements.append(Spacer(1, 5))
            rel_text = "<i>Relations: " + "; ".join(entity_info["relations"]) + "</i>"
            elements.append(Paragraph(rel_text, text_style))
        
        elements.append(Spacer(1, 15))
    
    # Build PDF
    doc.build(elements)
    print(f"✅ PDF généré: {filename}")

if __name__ == "__main__":
    create_pdf("AEROCHECK_MCD_MLD.pdf")
