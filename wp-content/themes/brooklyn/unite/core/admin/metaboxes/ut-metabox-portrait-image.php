<?php

if( !function_exists('ut_metabox_portrait_image') ) :

    function ut_metabox_portrait_image() {

        $ut_metabox_portrait_image = array(

            'id'          => 'ut_metabox_portrait_image',
            'title'       => 'Featured Portrait Image',
            'desc'        => '',
            'pages'       => array( 'portfolio' ),
            'type'        => 'simple',
            'context'     => 'side',
            'priority'    => 'low',
            'fields'      => array(

                array(
                    'id' => 'ut_portrait_featured_image',
                    'metapanel' => 'ut-hero-type',
                    'label' => 'Upload',
                    'desc' => 'Only for showcases with Portrait Support. Should be at <b>least 750x1125</b> or higher with same aspect ratio.',
                    'type' => 'upload_id'
                )

            )

        );

        ot_register_meta_box( $ut_metabox_portrait_image );

    }

    add_action( 'admin_init', 'ut_metabox_portrait_image' );

endif;


if( !function_exists('ut_metabox_feature_image_mobile') ) :

    function ut_metabox_feature_image_mobile() {

        $ut_metabox_feature_image_tablet = array(

            'id'          => 'ut_metabox_feature_image_tablet',
            'title'       => 'Featured Image Tablet',
            'desc'        => '',
            'pages'       => array( 'post' ),
            'type'        => 'simple',
            'context'     => 'side',
            'priority'    => 'low',
            'fields'      => array(

                array(
                    'id'        => 'ut_featured_image_tablet',
                    'metapanel' => 'ut-hero-type',
                    'label'     => '',
                    'desc'      => 'Only for Hero Section!',
                    'type'      => 'upload_id'
                )

            )

        );

        ot_register_meta_box( $ut_metabox_feature_image_tablet );

        $ut_metabox_feature_image_mobile = array(

            'id'          => 'ut_metabox_feature_image_mobile',
            'title'       => 'Featured Image Mobile',
            'desc'        => '',
            'pages'       => array( 'post' ),
            'type'        => 'simple',
            'context'     => 'side',
            'priority'    => 'low',
            'fields'      => array(

                array(
                    'id'        => 'ut_featured_image_mobile',
                    'metapanel' => 'ut-hero-type',
                    'label'     => '',
                    'desc'      => 'Only for Hero Section!',
                    'type'      => 'upload_id'
                )

            )

        );

        ot_register_meta_box( $ut_metabox_feature_image_mobile );

    }

    add_action( 'admin_init', 'ut_metabox_feature_image_mobile' );

endif;